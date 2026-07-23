package storage

import "testing"

func Test_parseS3URL_ValidURL_ReturnsBucketAndKey(t *testing.T) {
	cases := []struct {
		in         string
		wantBucket string
		wantKey    string
	}{
		{"s3://ffv-uploads/abc-123/att-456.pdf", "ffv-uploads", "abc-123/att-456.pdf"},
		{"s3://bucket/single", "bucket", "single"},
		{"s3://b/a/b/c/d.txt", "b", "a/b/c/d.txt"},
	}
	for _, c := range cases {
		t.Run(c.in, func(t *testing.T) {
			b, k, err := parseS3URL(c.in)
			if err != nil {
				t.Fatalf("erro inesperado: %v", err)
			}
			if b != c.wantBucket {
				t.Errorf("bucket: esperava %q, recebi %q", c.wantBucket, b)
			}
			if k != c.wantKey {
				t.Errorf("key: esperava %q, recebi %q", c.wantKey, k)
			}
		})
	}
}

func Test_parseS3URL_Invalid_ReturnsError(t *testing.T) {
	cases := []string{
		"file:///tmp/foo.pdf", // schema errado
		"s3://",               // vazio
		"s3://bucketonly",     // sem key
		"s3://bucket/",        // key vazia
		"",                    // string vazia
		"https://bucket/key",  // outro schema
	}
	for _, in := range cases {
		t.Run(in, func(t *testing.T) {
			if _, _, err := parseS3URL(in); err == nil {
				t.Errorf("esperava erro para %q, mas passou", in)
			}
		})
	}
}
