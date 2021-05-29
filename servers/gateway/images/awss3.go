package images

import (
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"strings"

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

func SpecificImageHTTP(w http.ResponseWriter, r *http.Request) {
	path := path.Base(r.URL.Path)
	if r.Method == http.MethodPost {
		contType := r.Header.Get("Content-Type")
		okStatus := true
		if !strings.HasPrefix(contType, "image") {
			okStatus = false
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("the request does not contain an image content type"))
		}
		if okStatus {
			err := UploadFile(r.Body, path)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("something went wrong"))
			} else {
				w.WriteHeader(http.StatusCreated)
			}
		}
	} else if r.Method == http.MethodGet {
		file, err := GetFile(path)
		okStatus := true
		if err != nil {
			okStatus = false
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("something went wrong with the file key"))
		}
		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			okStatus = false
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("the file was not encoded properly"))
		}
		if okStatus {
			w.WriteHeader(http.StatusOK)
			w.Header().Add("Content-Type", "image/*")
			w.Write(fileBytes)
		}
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("this endpoint only accepts GET and POST requests"))
	}

}

func UploadFile(imgByte io.ReadCloser, name string) error {
	sess, err := NewS3Session()
	if err != nil {
		return err
	}
	uploader := s3manager.NewUploader(sess)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String("info441images"),
		Key:    aws.String(name),
		Body:   imgByte,
	})
	return err
}

func GetFile(bucketKey string) (*os.File, error) {
	sess, err := NewS3Session()
	if err != nil {
		return nil, err
	}
	downloader := s3manager.NewDownloader(sess)
	file, err := os.Create(bucketKey)
	if err != nil {
		return nil, err
	}
	_, err = downloader.Download(file,
		&s3.GetObjectInput{
			Bucket: aws.String("info441images"),
			Key:    aws.String(bucketKey),
		})
	return file, err
}
