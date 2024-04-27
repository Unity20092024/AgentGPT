from django.urls import path
from .views import router

urlpatterns = [
    path('', router.get_api_root_view(), name='api-root'),
]

__all__ = ["urlpatterns"]
