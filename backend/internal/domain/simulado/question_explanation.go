package simulado

// QuestionExplanation é o schema rico de explicação (v2).
// whyWrong mapeia optionID → razão (ex: {"A": "...", "C": "..."}).
type QuestionExplanation struct {
	Summary          string            `json:"summary"`
	WhyCorrect       string            `json:"whyCorrect"`
	WhyWrong         map[string]string `json:"whyWrong,omitempty"`
	KeyConcept       string            `json:"keyConcept,omitempty"`
	CompareWith      []string          `json:"compareWith,omitempty"`
	RealWorldContext string            `json:"realWorldContext,omitempty"`
	CommonMistakes   []string          `json:"commonMistakes,omitempty"`
	TutorSeeds       []string          `json:"tutorSeeds,omitempty"`
}

// DBQuestion é a struct de questão persistida no banco (schema completo).
// Separada de Question para não quebrar o catálogo estático existente.
type DBQuestion struct {
	ID           string
	SimuladoID   string
	Stem         string
	Options      []QuestionOption
	CorrectID    OptionID
	Explanation  QuestionExplanation
	Topic        Topic
	Domain       string
	Difficulty   Difficulty
	ScenarioType string
	Tags         []string
	Source       string
	Status       string
}
