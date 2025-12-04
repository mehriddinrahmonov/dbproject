DROP TABLE IF EXISTS payment_tickets;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS promo_codes;
DROP TABLE IF EXISTS attendees;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS organizers;

-- TABLE: organizers
-- Represents concert promoters and event companies

CREATE TABLE organizers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: venues
-- Physical locations where concerts are held

CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    venue_type ENUM('arena', 'theater', 'outdoor', 'club', 'stadium') DEFAULT 'theater',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (capacity > 0),
    INDEX idx_city (city),
    INDEX idx_venue_type (venue_type),
    INDEX idx_capacity (capacity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: attendees
-- Customers who purchase concert tickets

CREATE TABLE attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: promo_codes
-- Promotional discount codes for ticket sales

CREATE TABLE promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    max_uses INT DEFAULT 0,
    uses_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    
    CHECK (discount_percent >= 0 AND discount_percent <= 100),
    CHECK (discount_amount >= 0),
    CHECK (max_uses >= 0),
    CHECK (uses_count >= 0),
    CHECK (uses_count <= max_uses),
    CHECK (valid_until IS NULL OR valid_until > valid_from),
    INDEX idx_code (code),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: events
-- Individual concert events

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue_id INT NOT NULL,
    organizer_id INT NOT NULL,
    category ENUM('Rock', 'Pop', 'Hip-Hop', 'Jazz', 'Electronic', 'Country', 'Classical', 'R&B', 'Metal', 'Indie') DEFAULT 'Pop',
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES organizers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CHECK (end_time > start_time),
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_venue (venue_id),
    INDEX idx_organizer (organizer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: ticket_types
-- Different ticket categories for each event (VIP, General, etc.)

CREATE TABLE ticket_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity_available INT NOT NULL,
    description TEXT,
    perks TEXT,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    CHECK (price >= 0),
    CHECK (quantity_available >= 0),
    UNIQUE KEY unique_event_type (event_id, type_name),
    INDEX idx_event (event_id),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: tickets
-- Individual tickets purchased by attendees

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    ticket_type_id INT NOT NULL,
    attendee_id INT NOT NULL,
    seat_number VARCHAR(20),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('reserved', 'paid', 'used', 'cancelled') DEFAULT 'reserved',
    is_vip BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_event (event_id),
    INDEX idx_attendee (attendee_id),
    INDEX idx_status (status),
    INDEX idx_ticket_type (ticket_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: payments
-- Financial transactions for ticket purchases

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendee_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Credit Card', 'Debit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Cash') DEFAULT 'Credit Card',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    promo_code_id INT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    
    FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    CHECK (amount >= 0),
    INDEX idx_attendee (attendee_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TABLE: payment_tickets

CREATE TABLE payment_tickets (
    payment_id INT NOT NULL,
    ticket_id INT NOT NULL,
    
    PRIMARY KEY (payment_id, ticket_id),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_payment (payment_id),
    INDEX idx_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TRIGGERS
-- Automated operations for business logic enforcement


DELIMITER //
CREATE TRIGGER increment_promo_usage 
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE promo_codes 
        SET uses_count = uses_count + 1 
        WHERE id = NEW.promo_code_id;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER check_venue_capacity
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
    DECLARE venue_cap INT;
    DECLARE tickets_sold INT;
    
    -- Get venue capacity for this event
    SELECT v.capacity INTO venue_cap
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE e.id = NEW.event_id;
    
    -- Count tickets already sold for this event
    SELECT COUNT(*) INTO tickets_sold
    FROM tickets
    WHERE event_id = NEW.event_id 
    AND status IN ('paid', 'reserved');
    
    -- Check if adding this ticket would exceed capacity
    IF tickets_sold >= venue_cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot issue ticket: venue is at full capacity';
    END IF;
END//
DELIMITER ;

-- Trigger: Update ticket type quantity when ticket is sold
DELIMITER //
CREATE TRIGGER update_ticket_type_quantity
AFTER INSERT ON tickets
FOR EACH ROW
BEGIN
    UPDATE ticket_types
    SET quantity_available = quantity_available - 1
    WHERE id = NEW.ticket_type_id
    AND quantity_available > 0;
END//
DELIMITER ;

-- Trigger: Restore ticket type quantity when ticket is cancelled
DELIMITER //
CREATE TRIGGER restore_ticket_type_quantity
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        UPDATE ticket_types
        SET quantity_available = quantity_available + 1
        WHERE id = NEW.ticket_type_id;
    END IF;
END//
DELIMITER ;


CREATE OR REPLACE VIEW event_details AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.start_time,
    e.end_time,
    e.category,
    e.status,
    v.name AS venue_name,
    v.address AS venue_address,
    v.city AS venue_city,
    v.state AS venue_state,
    v.capacity AS venue_capacity,
    o.name AS organizer_name,
    o.company_name AS organizer_company
FROM events e
JOIN venues v ON e.venue_id = v.id
JOIN organizers o ON e.organizer_id = o.id;

CREATE OR REPLACE VIEW event_sales_summary AS
SELECT 
    e.id AS event_id,
    e.title AS event_title,
    COUNT(t.id) AS tickets_sold,
    SUM(tt.price) AS gross_revenue,
    v.capacity AS venue_capacity,
    (v.capacity - COUNT(t.id)) AS remaining_seats
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'reserved')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
JOIN venues v ON e.venue_id = v.id
GROUP BY e.id, e.title, v.capacity;

