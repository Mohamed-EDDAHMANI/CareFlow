# ---------------------------------
# Variables
# ---------------------------------
BASE_URL = http://localhost:5000
API_URL = $(BASE_URL)/apiCli
METHOD = POST
ROUTE = /auth/login
CONTENT_TYPE = Content-Type: application/json
EMAIL = dsimo4323@gmail.com
PASSWORD = simosimo
ACCESS_TOKEN_ADMIN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWE0YjQ3NmNmZTdjMDg0YjUxZTc5NSIsInJvbGVJZCI6IjY4ZTkxYTc4NGM0MWE5ZmM1NWFjNGUwMCIsIm5hbWUiOiJNb2hhbWVkIEFMSSIsImlhdCI6MTc2MDIxNTkzMywiZXhwIjoxNzYwMjE5NTMzfQ.y523bsh4yRr00r5edexLtrmE7z3r4VaO6PeUj3tTqDg
ERFRESH_TOKEN_ADMIN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWE0YjQ3NmNmZTdjMDg0YjUxZTc5NSIsInJvbGVJZCI6IjY4ZTkxYTc4NGM0MWE5ZmM1NWFjNGUwMCIsIm5hbWUiOiJNb2hhbWVkIEFMSSIsImlhdCI6MTc2MDIxNTkzMywiZXhwIjoxNzYwODIwNzMzfQ.vhrjCTMJ1ZMoGA5rnaIn0rkz9UVuJDamGf54Ej14BKk
# ---------------------------------
# Docker Commands
# ---------------------------------

build:
	docker-compose -p cliniqueservice -f docker/docker-compose.yml build app

up:
	docker-compose -p cliniqueservice -f docker/docker-compose.yml up

down:
	docker-compose -p cliniqueservice -f docker/docker-compose.yml down

# ---------------------------------
# Monitoring Commands
# ---------------------------------

logs:
	docker logs cliniqueService_app -f

status:
	docker ps

health:
	curl -s $(BASE_URL)/health

# ---------------------------------
# Flexible API Testing Commands
# ---------------------------------

# Usage: make api METHOD=POST ROUTE=/auth/login CONTENT='{"email":"user@test.com","password":"123"}'
api:
	@echo "Testing: $(METHOD) $(API_URL)$(ROUTE)"
	curl -s -X $(METHOD) "$(API_URL)$(ROUTE)" \
	$(if $(CONTENT),-H "$(CONTENT_TYPE)" -d '$(CONTENT)')

# Quick login test
login:
	make api METHOD=POST ROUTE=/auth/login CONTENT='{"email":"$(EMAIL)","password":"$(PASSWORD)"}'

# Quick register test  
register:
	make api METHOD=POST ROUTE=/auth/register CONTENT='{"name":"Test User","email":"$(EMAIL)","password":"$(PASSWORD)","birthDate":"$(BIRTHDAY)","roleId":"$(ROLE_ID)","status":"$(STATUS)","cin":"$(CIN)"}'

# Quick health check
ping:
	curl -s $(BASE_URL)/health

# Test database connection
test-db:
	make api METHOD=GET ROUTE=/auth/test-db

# Get users (when implemented)
users:
	make api METHOD=GET ROUTE=/users


create_user:
	curl -X PUT http://localhost:3000/api/users/123456789 \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <your_access_token>" \
	-d '{"name": "Mohamed Eddahmani"}'

# Different content type examples
form-test:
	make api METHOD=POST ROUTE=/form CONTENT_TYPE="application/x-www-form-urlencoded" CONTENT='name=John&email=john@test.com'

upload-test:
	make api METHOD=POST ROUTE=/upload CONTENT_TYPE="multipart/form-data" CONTENT='@file.txt'

xml-test:
	make api METHOD=POST ROUTE=/xml CONTENT_TYPE="application/xml" CONTENT='<user><name>John</name></user>'

text-test:
	make api METHOD=POST ROUTE=/text CONTENT_TYPE="text/plain" CONTENT='Simple text message'


# Custom test examples:
# make api METHOD=GET ROUTE=/appointments
# make api METHOD=POST ROUTE=/users CONTENT='{"name":"John","email":"john@test.com"}'
# make api METHOD=PUT ROUTE=/users/123 CONTENT='{"name":"Updated Name"}'
# make api METHOD=POST ROUTE=/custom CONTENT_TYPE="custom/type" CONTENT='custom data'
