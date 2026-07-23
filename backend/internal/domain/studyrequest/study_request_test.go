package studyrequest

import (
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

func validInput() Input {
	return Input{
		Name:        "Maria da Silva",
		Email:       "maria@example.com",
		StudyArea:   "medicina-veterinaria",
		Subject:     "Genética animal",
		Description: "Preciso estudar genética para uma prova daqui a 2 semanas.",
	}
}

func Test_New_ValidInput_ReturnsAggregate(t *testing.T) {
	now := time.Now()
	req, err := New(validInput(), now)
	if err != nil {
		t.Fatalf("New retornou erro inesperado: %v", err)
	}
	if req.Status() != StatusPending {
		t.Errorf("status inicial esperado=%q got=%q", StatusPending, req.Status())
	}
	if req.ID().IsZero() {
		t.Error("ID não pode ser vazio após New")
	}
	if req.Email() != "maria@example.com" {
		t.Errorf("email deveria estar lowercased/trimmed: got %q", req.Email())
	}
}

func Test_New_MissingRequired_ReturnsValidationError(t *testing.T) {
	cases := map[string]func(Input) Input{
		"name vazio":        func(in Input) Input { in.Name = ""; return in },
		"email vazio":       func(in Input) Input { in.Email = ""; return in },
		"email sem @":       func(in Input) Input { in.Email = "no-at-here"; return in },
		"studyArea vazia":   func(in Input) Input { in.StudyArea = ""; return in },
		"subject vazio":     func(in Input) Input { in.Subject = ""; return in },
		"description vazia": func(in Input) Input { in.Description = ""; return in },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			in := mutate(validInput())
			_, err := New(in, time.Now())
			if err == nil {
				t.Fatal("esperado erro de validação, got nil")
			}
			if !errors.Is(err, shared.ErrValidation) {
				t.Errorf("esperado ErrValidation, got %v", err)
			}
		})
	}
}

func Test_NewAttachment_RejectsDisallowedContentType(t *testing.T) {
	_, err := NewAttachment("malware.exe", "application/x-msdownload", 100, "file:///tmp/x", time.Now())
	if err == nil {
		t.Fatal("esperado erro para content-type não permitido")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Errorf("esperado ErrValidation, got %v", err)
	}
}

func Test_NewAttachment_RejectsOversized(t *testing.T) {
	_, err := NewAttachment("big.pdf", "application/pdf", MaxAttachmentSize+1, "file:///tmp/big.pdf", time.Now())
	if err == nil {
		t.Fatal("esperado erro para arquivo grande demais")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Errorf("esperado ErrValidation, got %v", err)
	}
}

func Test_AttachFile_EnforcesMaxCount(t *testing.T) {
	now := time.Now()
	req, err := New(validInput(), now)
	if err != nil {
		t.Fatalf("setup: %v", err)
	}
	for i := 0; i < MaxAttachmentsPerRequest; i++ {
		att, err := NewAttachment("a.pdf", "application/pdf", 10, "file:///a", now)
		if err != nil {
			t.Fatalf("setup attachment: %v", err)
		}
		if err := req.AttachFile(att); err != nil {
			t.Fatalf("attach %d falhou: %v", i, err)
		}
	}
	att, _ := NewAttachment("a.pdf", "application/pdf", 10, "file:///a", now)
	if err := req.AttachFile(att); err == nil {
		t.Error("esperado erro ao exceder MaxAttachmentsPerRequest")
	}
}

func Test_Status_IsValid(t *testing.T) {
	valid := []Status{StatusPending, StatusInReview, StatusInProduction, StatusReady, StatusRejected}
	for _, s := range valid {
		if !s.IsValid() {
			t.Errorf("status %q deveria ser válido", s)
		}
	}
	if Status("invalid").IsValid() {
		t.Error("status arbitrário não deveria ser válido")
	}
}

func Test_ChangeStatus_ValidTransitions(t *testing.T) {
	req, _ := New(validInput(), time.Now())
	cases := []Status{StatusInReview, StatusInProduction, StatusReady}
	for _, target := range cases {
		later := req.UpdatedAt().Add(time.Second)
		if err := req.ChangeStatus(target, later); err != nil {
			t.Fatalf("transição para %q falhou: %v", target, err)
		}
		if req.Status() != target {
			t.Errorf("esperado status %q, got %q", target, req.Status())
		}
		if !req.UpdatedAt().Equal(later) {
			t.Errorf("updatedAt deveria ter sido atualizado")
		}
	}
}

func Test_ChangeStatus_RejectInvalid(t *testing.T) {
	req, _ := New(validInput(), time.Now())
	if err := req.ChangeStatus(Status("garbage"), time.Now()); err == nil {
		t.Fatal("esperado erro para status inválido")
	}
}

func Test_ChangeStatus_IsIdempotent(t *testing.T) {
	req, _ := New(validInput(), time.Now())
	original := req.UpdatedAt()
	later := original.Add(time.Hour)
	if err := req.ChangeStatus(StatusPending, later); err != nil {
		t.Fatalf("idempotente deveria funcionar: %v", err)
	}
	if !req.UpdatedAt().Equal(original) {
		t.Error("idempotente não deveria atualizar updatedAt")
	}
}

func Test_SetInternalNotes_TrimsAndLimits(t *testing.T) {
	req, _ := New(validInput(), time.Now())
	if err := req.SetInternalNotes("  conferir prazo  ", time.Now()); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if req.InternalNotes() != "conferir prazo" {
		t.Errorf("esperado trim, got %q", req.InternalNotes())
	}

	huge := strings.Repeat("a", 10001)
	if err := req.SetInternalNotes(huge, time.Now()); err == nil {
		t.Fatal("esperado erro para notas acima do limite")
	}
}

func Test_AssignToUser_SetsUserID(t *testing.T) {
	req, _ := New(validInput(), time.Now())
	if !req.UserID().IsZero() {
		t.Fatal("setup: userID deveria começar vazio")
	}
	uid := shared.UserID("user-123")
	now := time.Now()
	req.AssignToUser(uid, now)
	if req.UserID() != uid {
		t.Errorf("esperado userID %q, got %q", uid, req.UserID())
	}
}
