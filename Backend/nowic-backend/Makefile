.PHONY: run test test-all lint format migrate shell superuser make-admin check qa

run:
	python manage.py runserver

test:
	pytest tests/ -v --tb=short

test-all:
	pytest -q

lint:
	flake8 .
	isort --check-only .

check:
	python manage.py check

format:
	black .
	isort .

migrate:
	python manage.py makemigrations
	python manage.py migrate

shell:
	python manage.py shell

superuser:
	python manage.py createsuperuser

make-admin:
	python manage.py make_admin

qa: check lint test-all
