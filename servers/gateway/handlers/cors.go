package handlers

import "net/http"

// This is the struct declaration for CORS
type CORS struct {
	handler http.Handler
}

// A CORS constructor
func NewCORS(handler http.Handler) *CORS {
	return &CORS{handler}
}

// This is the middleware func for http.
func (c *CORS) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Access-Control-Max-Age", "600")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	c.handler.ServeHTTP(w, r)
}
