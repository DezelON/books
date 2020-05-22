from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('', views.books),
    path('update', views.update),
    path('get', views.get),
]