package handlers

import (
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

// ...

func NewS3Session() (*session.Session, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-west-2")},
	)
	if err != nil {
		return nil, err
	}
	return sess, nil
}

func UploadFile(filePath string) error {
	sess, err := NewS3Session()
	if err != nil {
		return err
	}
	uploader := s3manager.NewUploader(sess)
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String("info441images"),
		Key: aws.String(file.Name()),
		Body: file,
	})
	return err
}
