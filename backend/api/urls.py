from django.urls import path
from . import views

urlpatterns = [
    # Contacts
    path('contacts/', views.contacts_list),
    path('contacts/<str:contact_id>/', views.contact_detail),

    # Campaigns
    path('campaigns/', views.campaigns_list),
    path('campaigns/<str:campaign_id>/', views.campaign_detail),

    # Tasks
    path('tasks/', views.tasks_list),
    path('tasks/<str:task_id>/', views.task_detail),

    # Automations
    path('automations/', views.automations_list),
    path('automations/<str:automation_id>/', views.automation_detail),

    # Messages
    path('messages/<str:contact_id>/', views.messages_list),

    # WhatsApp
    path('whatsapp/webhook/', views.whatsapp_webhook),
    path('whatsapp/send/', views.whatsapp_send),
    path('whatsapp/bulk-send/', views.whatsapp_bulk_send),
]
