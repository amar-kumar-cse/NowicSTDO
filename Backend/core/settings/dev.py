from .base import *

DEBUG = True
CORS_ALLOW_ALL_ORIGINS = True
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ── Local Dev: Use SQLite so you don't need Supabase connection ──
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'dev.sqlite3',
    }
}

# ── Local Media Storage ──
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
