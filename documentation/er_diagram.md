# Entity-Relationship Diagram

This document contains the Entity-Relationship (E-R) Diagram for the Concert Ticketing System.

```mermaid
erDiagram
    ORGANIZERS ||--|{ EVENTS : "organizes"
    VENUES ||--|{ EVENTS : "hosts"
    EVENTS ||--|{ TICKET_TYPES : "has"
    EVENTS ||--|{ TICKETS : "has sold"
    TICKET_TYPES ||--|{ TICKETS : "defines type of"
    ATTENDEES ||--|{ TICKETS : "purchases"
    ATTENDEES ||--|{ PAYMENTS : "makes"
    PROMO_CODES |o--|{ PAYMENTS : "applies to"
    PAYMENTS ||--|{ PAYMENT_TICKETS : "includes"
    TICKETS ||--|{ PAYMENT_TICKETS : "paid via"

    ORGANIZERS {
        int id PK
        string name
        string email
        string phone
        string company_name
    }

    VENUES {
        int id PK
        string name
        string address
        string city
        string state
        int capacity
        enum venue_type
    }

    EVENTS {
        int id PK
        string title
        text description
        date event_date
        time start_time
        time end_time
        enum category
        enum status
        int venue_id FK
        int organizer_id FK
    }

    TICKET_TYPES {
        int id PK
        string type_name
        decimal price
        int quantity_available
        text description
        text perks
        int event_id FK
    }

    ATTENDEES {
        int id PK
        string first_name
        string last_name
        string email
        string phone
        date date_of_birth
    }

    TICKETS {
        int id PK
        string seat_number
        timestamp purchase_date
        enum status
        boolean is_vip
        int event_id FK
        int ticket_type_id FK
        int attendee_id FK
    }

    PAYMENTS {
        int id PK
        decimal amount
        enum payment_method
        timestamp payment_date
        string transaction_id
        enum status
        int attendee_id FK
        int promo_code_id FK
    }

    PAYMENT_TICKETS {
        int payment_id PK, FK
        int ticket_id PK, FK
    }

    PROMO_CODES {
        int id PK
        string code
        decimal discount_percent
        decimal discount_amount
        timestamp valid_from
        timestamp valid_until
        int max_uses
        int uses_count
        boolean active
    }
```

## Legend

- **PK**: Primary Key
- **FK**: Foreign Key
- **||--|{**: One-to-Many relationship
- **|o--|{**: Optional One-to-Many relationship
- **||--||**: One-to-One relationship
