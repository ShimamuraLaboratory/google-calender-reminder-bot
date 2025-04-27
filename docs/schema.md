```mermaid
---
title: Google Calendar Reminder Bot ER図
---

erDiagram
    roles {
        string role_id PK "Discordのrole_idをそのまま使用"
        string name "Role名"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    members {
        string member_id PK "Discordのmember_idをそのまま使用"
        string last_name "名前"
        string first_name "苗字"
        string user_name "Discordのユーザー名"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    role_member {
        string role_id PK
        string member_id PK
    }

    reminds {
        string id PK "リマインダーのID, UUID"
        string text "リマインダー本文"
        string schedule_id FK "予定のID"
        timestamp sended_at "送信日時"
        timestamp deleted_at
    }

    remind_member {
        string remind_id PK
        string member_id PK
    }

    schedules {
        string id PK "予定のID, UUID"
        string title "予定のタイトル"
        string destiribution "概要"
        datetime scheduled_at "予定日時"
        int reminde_days "何日前にリマインドするか"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    schedule_member {
        string schedule_id PK
        string member_id PK
    }

    schedule_role {
        string schedule_id PK
        string role_id PK
    }

    roles ||--o{ schedule_role : ""
    roles ||--o{ role_member : ""
    members ||--o{ schedule_member : ""
    members ||--o{ remind_member : ""
    members ||--o{ role_member : ""
    schedules ||--o{ schedule_member : ""
    schedules ||--o{ schedule_role : ""
    schedules ||--o{ reminds : ""
    reminds ||--o{ remind_member : ""
