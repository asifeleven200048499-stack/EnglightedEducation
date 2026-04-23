from django.urls import path
from . import views

urlpatterns = [
    path('contacts/', views.contacts_list),
    path('contacts/options/', views.contact_options),
    path('contacts/<str:contact_id>/', views.contact_detail),
    path('campaigns/', views.campaigns_list),
    path('campaigns/<str:campaign_id>/', views.campaign_detail),
    path('tasks/', views.tasks_list),
    path('tasks/<str:task_id>/', views.task_detail),
    path('automations/', views.automations_list),
    path('automations/<str:automation_id>/', views.automation_detail),
    path('messages/<str:contact_id>/', views.messages_list),
    path('callers/', views.callers_list),
    path('callers/login/', views.caller_login),
    path('callers/<str:caller_id>/', views.caller_detail),
    path('callers/<str:caller_id>/contacts/', views.caller_contacts),
    path('whatsapp/webhook/', views.whatsapp_webhook),
    path('whatsapp/send/', views.whatsapp_send),
    path('whatsapp/send-template/', views.whatsapp_send_template),
    path('whatsapp/templates/', views.whatsapp_templates),
]
