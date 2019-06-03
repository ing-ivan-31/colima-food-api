# colima-food-api

**Build image**

docker-compose build

**Up service**

docker-compose up

**Create new user with this body**

**Endpoint:** http://localhost:6200/api/v1/users

`{
 	"user": {
        "first_name":"John",
        "last_name":"Doe",
        "email":"doe@gmail.com",
        "phone_number": "3311369874",
        "password": "secret"
 	}
 }`
 

**Check Login send request with this body in JSON format**

**Endpoint:** http://localhost:6200/api/v1/auth/login

`{
	"user": {
	"email":"doe@gmail.com",
	"password": "secret"
	}	
}`

**the response will be in this format**

`{
  "user": {
    "_id": "5ceb14cffa1dff019f0181f6",
    "email": "doe@gmail.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvcnJvc0BnbWFpbC5jb20iLCJpZCI6IjVjZWIxNGNmZmExZGZmMDE5ZjAxODFmNiIsImV4cCI6MTU2NDA5NDI0MywiaWF0IjoxNTU4OTEwMjQzfQ.lIyHj-x1PUb2_Os84xfAm3vTpLM7KBZ0PZPUOBk4zWc",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "3311369874"
  }
}`

**For the following requests you need set up the HEADER for get the data.**

`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvcnJvc0BnbWFpbC5jb20iLCJpZCI6IjVjZWIxNGNmZmExZGZmMDE5ZjAxODFmNiIsImV4cCI6MTU2NDA5NDI0MywiaWF0IjoxNTU4OTEwMjQzfQ.lIyHj-x1PUb2_Os84xfAm3vTpLM7KBZ0PZPUOBk4zWc`

**Standard Success Json Responses**

{
    "users": {
    }
}

**Standard Failure Json Responses**
