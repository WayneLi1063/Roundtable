package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

const headerCORS = "Access-Control-Allow-Origin"
const corsAnyOrigin = "*"
const headerCT = "Content-Type"
const jsonContent = "application/json"

//PreviewImage represents a preview image for a page
type PreviewImage struct {
	URL       string `json:"url,omitempty"`
	SecureURL string `json:"secureURL,omitempty"`
	Type      string `json:"type,omitempty"`
	Width     int    `json:"width,omitempty"`
	Height    int    `json:"height,omitempty"`
	Alt       string `json:"alt,omitempty"`
}

//PageSummary represents summary properties for a web page
type PageSummary struct {
	Type        string          `json:"type,omitempty"`
	URL         string          `json:"url,omitempty"`
	Title       string          `json:"title,omitempty"`
	SiteName    string          `json:"siteName,omitempty"`
	Description string          `json:"description,omitempty"`
	Author      string          `json:"author,omitempty"`
	Keywords    []string        `json:"keywords,omitempty"`
	Icon        *PreviewImage   `json:"icon,omitempty"`
	Images      []*PreviewImage `json:"images,omitempty"`
}

//SummaryHandler handles requests for the page summary API.
//This API expects one query string parameter named `url`,
//which should contain a URL to a web page. It responds with
//a JSON-encoded PageSummary struct containing the page summary
//meta-data.
func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")

	if len(url) == 0 {
		http.Error(w, "URL query not supplied.", http.StatusBadRequest)
		return
	}

	bodyStream, err := fetchHTML(url)

	defer bodyStream.Close()

	if err != nil {
		http.Error(w, "Cannot reach supplied URL.", http.StatusBadRequest)
		return
	}

	pageSummary := &PageSummary{}

	pageSummary, err = extractSummary(url, bodyStream)

	if err != nil {
		http.Error(w, "Cannot extract summary.", http.StatusInternalServerError)
		return
	}

	w.Header().Add(headerCORS, corsAnyOrigin)
	w.Header().Add(headerCT, jsonContent)

	enc := json.NewEncoder(w)
	if err := enc.Encode(pageSummary); err != nil {
		http.Error(w, "Cannot encode JSON.", http.StatusInternalServerError)
		return
	}
}

//fetchHTML fetches `pageURL` and returns the body stream or an error.
//Errors are returned if the response status code is an error (>=400),
//or if the content type indicates the URL is not an HTML page.
func fetchHTML(pageURL string) (io.ReadCloser, error) {
	resp, err := http.Get(pageURL)

	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, errors.New(resp.Status)
	}

	ctype := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(ctype, "text/html") {
		return nil, errors.New("Bad content type.")
	}

	return resp.Body, nil
}

//extractSummary tokenizes the `htmlStream` and populates a PageSummary
//struct with the page's summary meta-data.
func extractSummary(pageURL string, htmlStream io.ReadCloser) (*PageSummary, error) {
	pageSummary := PageSummary{}
	previewIcon := PreviewImage{}
	previewImgs := []*PreviewImage{}
	err := errors.New("Placeholder")
	parsingImgIndex := -1

	tokenizer := html.NewTokenizer(htmlStream)

	// Keep track if we encountered og:description and og:title
	ogDescription := false
	ogTitle := false

	for {
		tokenType := tokenizer.Next()

		// token error handling
		if tokenType == html.ErrorToken {
			if tokenizer.Err() == io.EOF {
				break
			}
			return nil, errors.New("BadTokenError")
		}

		if tokenType == html.StartTagToken || tokenType == html.SelfClosingTagToken {
			token := tokenizer.Token()
			attributes := token.Attr
			reformattedMap := map[string]string{}
			for _, attr := range attributes {
				reformattedMap[attr.Key] = attr.Val
			}
			if token.Data == "meta" {
				content := reformattedMap["content"]

				// og:image
				if reformattedMap["property"] == "og:image" {
					previewImage := PreviewImage{}
					previewImage.URL, err = parseAbsoluteURL(pageURL, content)
					if err != nil {
						return nil, err
					}
					parsingImgIndex = parsingImgIndex + 1
					previewImgs = append(previewImgs, &previewImage)
					continue
				}
				if reformattedMap["property"] == "og:image:url" {
					previewImgs[parsingImgIndex].URL, err = parseAbsoluteURL(pageURL, content)
					if err != nil {
						return nil, err
					}
					continue
				}
				if reformattedMap["property"] == "og:image:secure_url" {
					previewImgs[parsingImgIndex].SecureURL, err = parseAbsoluteURL(pageURL, content)
					if err != nil {
						return nil, err
					}
					continue
				}
				if reformattedMap["property"] == "og:image:type" {
					previewImgs[parsingImgIndex].Type = content
					continue
				}
				if reformattedMap["property"] == "og:image:width" {
					previewImgs[parsingImgIndex].Width, _ = strconv.Atoi(content)
					continue
				}
				if reformattedMap["property"] == "og:image:height" {
					previewImgs[parsingImgIndex].Height, _ = strconv.Atoi(content)
					continue
				}
				if reformattedMap["property"] == "og:image:alt" {
					previewImgs[parsingImgIndex].Alt = content
					continue
				}

				// og:type
				if reformattedMap["property"] == "og:type" {
					pageSummary.Type = content
					continue
				}

				// og:url
				if reformattedMap["property"] == "og:url" {
					pageSummary.URL, err = parseAbsoluteURL(pageURL, content)
					if err != nil {
						return nil, err
					}
					continue
				}

				// og:title
				if reformattedMap["property"] == "og:title" {
					pageSummary.Title = content
					ogTitle = true
					continue
				}

				// og:site_name
				if reformattedMap["property"] == "og:site_name" {
					pageSummary.SiteName = content
					continue
				}

				// og:description and description
				if reformattedMap["property"] == "og:description" {
					pageSummary.Description = content
					ogDescription = true
					continue
				}
				if ogDescription == false && reformattedMap["name"] == "description" {
					pageSummary.Description = content
					continue
				}

				// author
				if reformattedMap["name"] == "author" {
					pageSummary.Author = content
					continue
				}

				// keywords
				if reformattedMap["name"] == "keywords" {
					splitSlices := strings.Split(content, ",")
					for index, keyword := range splitSlices {
						splitSlices[index] = strings.TrimSpace(keyword)
					}
					pageSummary.Keywords = splitSlices
					continue
				}
			}
			// title
			if ogTitle == false && token.Data == "title" {
				token = tokenizer.Token()
				tokenType = tokenizer.Next()
				pageSummary.Title = tokenizer.Token().Data
				continue
			}

			// icon
			if token.Data == "link" {
				if reformattedMap["rel"] == "icon" {
					previewIcon.Type = reformattedMap["type"]
					previewIcon.URL, err = parseAbsoluteURL(pageURL, reformattedMap["href"])
					if err != nil {
						return nil, err
					}
					xIndex := strings.IndexRune(reformattedMap["sizes"], 'x')
					if xIndex != -1 {
						previewIcon.Height, _ = strconv.Atoi(reformattedMap["sizes"][:xIndex])
						previewIcon.Width, _ = strconv.Atoi(reformattedMap["sizes"][xIndex+1:])
					}
					pageSummary.Icon = &previewIcon
					continue
				}
			}
		}
		if tokenType == html.EndTagToken {
			token := tokenizer.Token()
			// end early if we encountered the head end tag
			if token.Data == "head" {
				if len(previewImgs) != 0 {
					pageSummary.Images = previewImgs
				}
				return &pageSummary, nil
			}
		}
	}
	if len(previewImgs) != 0 {
		pageSummary.Images = previewImgs
	}
	return &pageSummary, nil
}

// This function parses relative URL into absolute URL,
// given a base URL called pageURL and the relative path URL
// called pathURL. All variables are string based.
func parseAbsoluteURL(pageURL string, pathURL string) (string, error) {
	base, err := url.Parse(pageURL)
	if err != nil {
		return "", err
	}
	path, err := url.Parse(pathURL)
	if err != nil {
		return "", err
	}
	return base.ResolveReference(path).String(), nil
}
