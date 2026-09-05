.PHONY: run test test-all lint format migrate shell superuser make-admin qa

run:
	python manage.py runserver

test:
	pytest tests/ -v --tb=short

test-all:
	pytest -q

lint:
	flake8 . --count --statistics
	isort --check-only .

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

qa:
	python manage.py check
	flake8 . --count --statistics
	isort --check-only .
	pytest -q
