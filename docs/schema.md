```mermaid
---
title: Google Calendar Reminder Bot ER図
---

erDiagram
    roles {
        text role_id PK "Discordのrole_idをそのまま使用"
        text name "Role名"
        text created_at
        text updated_at
        text deleted_at
    }

    members {
        text member_id PK "Discordのmember_idをそのまま使用"
        text user_name "Discordのユーザー名"
        text created_at
        text updated_at
        text deleted_at
    }

    role_member {
        text role_id PK
        text member_id PK
    }

    reminds {
        text id PK "リマインダーのID, UUID"
        text text "リマインダー本文"
        text schedule_id FK "予定のID"
        text sended_at "送信日時"
        text deleted_at
    }

    remind_member {
        text remind_id PK
        text member_id PK
    }

    schedules {
        text id PK "予定のID, UUID"
        text title "予定のタイトル"
        text calendar_id "カレンダーのID"
        text event_id "google calendar上でのイベントID"
        text destiribution "概要"
        text start_at "開始日時"
        text end_at "終了日時"
        int reminde_days "何日前にリマインドするか"
        text created_at
        text updated_at
        text deleted_at
    }

    schedule_member {
        text schedule_id PK
        text member_id PK
    }

    schedule_role {
        text schedule_id PK
        text role_id PK
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
