# ---------------------------------
# Variables
# ---------------------------------
BASE_URL = http://localhost:3000
API_URL = $(BASE_URL)/api
METHOD = POST
ROUTE = /auth/login
CONTENT_TYPE = Content-Type: application/json
EMAIL = dsimo4323@gmail.com
PASSWORD = 123456

# ---------------------------------
# Docker Commands
# ---------------------------------

build:
	docker-compose -f docker/docker-compose.yml build

up:
	docker-compose -f docker/docker-compose.yml up -d

down:
	docker-compose -f docker/docker-compose.yml down

# ---------------------------------
# Monitoring Commands
# ---------------------------------

logs:
	docker logs careflow_app -f

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

# Different content type examples
form-test:
	make api METHOD=POST ROUTE=/form CONTENT_TYPE="application/x-www-form-urlencoded" CONTENT='name=John&email=john@test.com'

upload-test:
	make api METHOD=POST ROUTE=/upload CONTENT_TYPE="multipart/form-data" CONTENT='@file.txt'

xml-test:
	make api METHOD=POST ROUTE=/xml CONTENT_TYPE="application/xml" CONTENT='<user><name>John</name></user>'

text-test:
	make api METHOD=POST ROUTE=/text CONTENT_TYPE="text/plain" CONTENT='Simple text message'

# ---------------------------------
# Database Commands
# ---------------------------------

# Connect to admin database
db-admin:
	docker exec -it careflow_mongo mongosh admin

# Connect to careflow database with auth
db-connect:
	docker exec -it careflow_mongo mongosh "mongodb://admin:password@localhost:27017/careflow?authSource=admin"

# Reset MongoDB completely
db-reset:
	make down
	docker volume rm docker_mongo_data || true
	make up
	sleep 5

# Check MongoDB environment variables
db-env:
	docker exec -it careflow_mongo env | grep MONGO

# Custom test examples:
# make api METHOD=GET ROUTE=/appointments
# make api METHOD=POST ROUTE=/users CONTENT='{"name":"John","email":"john@test.com"}'
# make api METHOD=PUT ROUTE=/users/123 CONTENT='{"name":"Updated Name"}'
# make api METHOD=POST ROUTE=/custom CONTENT_TYPE="custom/type" CONTENT='custom data'
