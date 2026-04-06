from django.urls import path
from . import views

urlpatterns = [
    # Contacts
    path('contacts/', views.contacts_list, name='contacts-list'),
    path('contacts/<str:contact_id>/', views.contact_detail, name='contact-detail'),

    # Campaigns
    path('campaigns/', views.campaigns_list, name='campaigns-list'),
    path('campaigns/<str:campaign_id>/', views.campaign_detail, name='campaign-detail'),

    # Tasks
    path('tasks/', views.tasks_list, name='tasks-list'),
    path('tasks/<str:task_id>/', views.task_detail, name='task-detail'),

    # Automations
    path('automations/', views.automations_list, name='automations-list'),
    path('automations/<str:automation_id>/', views.automation_detail, name='automation-detail'),

    # Messages
    path('messages/<str:contact_id>/', views.messages_list, name='messages-list'),
]
