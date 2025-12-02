-- ================================================================
-- Concert Ticketing System - Sample Queries
-- Course: CS 301 Fundamentals of Database Systems
-- 10 Required Queries for Event Organizers and Administrators
-- ================================================================

-- ================================================================
-- QUERY 1: Top 10 concerts with the highest ticket sales
-- ================================================================
-- Business Value: Identify most popular concerts for marketing insights
-- and resource allocation

SELECT 
    e.id,
    e.title AS concert_title,
    e.category AS genre,
    e.event_date,
    v.name AS venue,
    COUNT(t.id) AS tickets_sold,
    SUM(tt.price) AS gross_revenue,
    o.company_name AS organizer
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id 
    AND t.status IN ('paid', 'used')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
JOIN venues v ON e.venue_id = v.id
JOIN organizers o ON e.organizer_id = o.id
GROUP BY e.id, e.title, e.category, e.event_date, v.name, o.company_name
ORDER BY tickets_sold DESC, gross_revenue DESC
LIMIT 10;

-- ================================================================
-- QUERY 2: Find concerts that are fully booked
-- ================================================================
-- Business Value: Identify sold-out shows for adding more dates
-- or increasing capacity planning

SELECT 
    e.id,
    e.title AS concert_title,
    e.event_date,
    v.name AS venue,
    v.capacity AS venue_capacity,
    COUNT(t.id) AS tickets_sold,
    ROUND((COUNT(t.id) / v.capacity) * 100, 2) AS capacity_percentage
FROM events e
JOIN venues v ON e.venue_id = v.id
LEFT JOIN tickets t ON e.id = t.event_id 
    AND t.status IN ('paid', 'reserved')
GROUP BY e.id, e.title, e.event_date, v.name, v.capacity
HAVING COUNT(t.id) >= v.capacity * 0.95  -- 95% or more is considered fully booked
ORDER BY capacity_percentage DESC;

-- ================================================================
-- QUERY 3: Identify attendees who purchased tickets for multiple concerts
-- ================================================================
-- Business Value: Find repeat customers for loyalty programs and
-- targeted marketing campaigns

SELECT 
    a.id,
    CONCAT(a.first_name, ' ', a.last_name) AS attendee_name,
    a.email,
    COUNT(DISTINCT e.id) AS concerts_attended,
    COUNT(t.id) AS total_tickets_purchased,
    SUM(tt.price) AS total_spent,
    GROUP_CONCAT(DISTINCT e.category ORDER BY e.category) AS genres_interested
FROM attendees a
JOIN tickets t ON a.id = t.attendee_id
JOIN events e ON t.event_id = e.id
JOIN ticket_types tt ON t.ticket_type_id = tt.id
WHERE t.status IN ('paid', 'used')
GROUP BY a.id, a.first_name, a.last_name, a.email
HAVING COUNT(DISTINCT e.id) > 1
ORDER BY concerts_attended DESC, total_spent DESC
LIMIT 50;

-- ================================================================
-- QUERY 4: Show total revenue per organizer
-- ================================================================
-- Business Value: Track organizer performance and commission calculations

SELECT 
    o.id,
    o.name AS organizer_name,
    o.company_name,
    COUNT(DISTINCT e.id) AS total_events,
    COUNT(t.id) AS total_tickets_sold,
    SUM(tt.price) AS gross_revenue,
    COALESCE(SUM(
        CASE 
            WHEN pc.discount_percent > 0 THEN tt.price * (pc.discount_percent / 100)
            WHEN pc.discount_amount > 0 THEN pc.discount_amount
            ELSE 0
        END
    ), 0) AS total_discounts,
    SUM(CASE WHEN t.is_vip = TRUE THEN tt.price ELSE 0 END) AS vip_revenue,
    ROUND(AVG(tt.price), 2) AS avg_ticket_price
FROM organizers o
LEFT JOIN events e ON o.id = e.organizer_id
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
LEFT JOIN payment_tickets pt ON t.id = pt.ticket_id
LEFT JOIN payments p ON pt.payment_id = p.id
LEFT JOIN promo_codes pc ON p.promo_code_id = pc.id
GROUP BY o.id, o.name, o.company_name
ORDER BY gross_revenue DESC;

-- ================================================================
-- QUERY 5: Find the most popular venues by total ticket sales
-- ================================================================
-- Business Value: Identify best-performing venues for future bookings

SELECT 
    v.id,
    v.name AS venue_name,
    v.city,
    v.state,
    v.venue_type,
    v.capacity,
    COUNT(DISTINCT e.id) AS concerts_hosted,
    COUNT(t.id) AS total_tickets_sold,
    SUM(tt.price) AS total_revenue,
    ROUND((COUNT(t.id) / (v.capacity * COUNT(DISTINCT e.id))) * 100, 2) AS avg_capacity_utilization,
    ROUND(SUM(tt.price) / COUNT(DISTINCT e.id), 2) AS avg_revenue_per_event
FROM venues v
LEFT JOIN events e ON v.id = e.venue_id
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
GROUP BY v.id, v.name, v.city, v.state, v.venue_type, v.capacity
HAVING concerts_hosted > 0
ORDER BY total_tickets_sold DESC, total_revenue DESC
LIMIT 15;

-- ================================================================
-- QUERY 6: List concerts with no remaining seats
-- ================================================================
-- Business Value: Manage inventory and identify need for additional shows

SELECT 
    e.id,
    e.title AS concert_title,
    e.event_date,
    e.start_time,
    v.name AS venue,
    v.capacity AS total_capacity,
    COUNT(t.id) AS tickets_sold,
    (v.capacity - COUNT(t.id)) AS remaining_seats,
    GROUP_CONCAT(DISTINCT tt.type_name ORDER BY tt.price DESC) AS sold_out_ticket_types
FROM events e
JOIN venues v ON e.venue_id = v.id
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'reserved')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
WHERE e.status = 'upcoming'
GROUP BY e.id, e.title, e.event_date, e.start_time, v.name, v.capacity
HAVING remaining_seats <= 0
ORDER BY e.event_date ASC;

-- ================================================================
-- QUERY 7: Find attendees who haven't paid but have reserved tickets
-- ================================================================
-- Business Value: Follow up on unpaid reservations to secure revenue
-- and release seats if needed

SELECT 
    a.id,
    CONCAT(a.first_name, ' ', a.last_name) AS attendee_name,
    a.email,
    a.phone,
    COUNT(t.id) AS reserved_tickets,
    SUM(tt.price) AS total_amount_due,
    GROUP_CONCAT(
        CONCAT(e.title, ' (', DATE_FORMAT(e.event_date, '%b %d'), ')')
        ORDER BY e.event_date
        SEPARATOR '; '
    ) AS reserved_events,
    MIN(t.purchase_date) AS first_reservation_date,
    DATEDIFF(NOW(), MIN(t.purchase_date)) AS days_since_reservation
FROM attendees a
JOIN tickets t ON a.id = t.attendee_id
JOIN events e ON t.event_id = e.id
JOIN ticket_types tt ON t.ticket_type_id = tt.id
WHERE t.status = 'reserved'
AND NOT EXISTS (
    SELECT 1 FROM payment_tickets pt
    JOIN payments p ON pt.payment_id = p.id
    WHERE pt.ticket_id = t.id AND p.status = 'completed'
)
GROUP BY a.id, a.first_name, a.last_name, a.email, a.phone
ORDER BY days_since_reservation DESC, total_amount_due DESC;

-- ================================================================
-- QUERY 8: Show daily ticket sales trends per event
-- ================================================================
-- Business Value: Analyze sales patterns to optimize pricing and
-- marketing campaign timing

SELECT 
    DATE(t.purchase_date) AS sale_date,
    e.title AS concert_title,
    e.event_date,
    COUNT(t.id) AS tickets_sold_that_day,
    SUM(tt.price) AS daily_revenue,
    ROUND(AVG(tt.price), 2) AS avg_ticket_price,
    COUNT(CASE WHEN t.is_vip = TRUE THEN 1 END) AS vip_tickets,
    COUNT(CASE WHEN t.is_vip = FALSE THEN 1 END) AS regular_tickets,
    DATEDIFF(e.event_date, DATE(t.purchase_date)) AS days_before_event
FROM tickets t
JOIN events e ON t.event_id = e.id
JOIN ticket_types tt ON t.ticket_type_id = tt.id
WHERE t.status IN ('paid', 'used')
AND t.purchase_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY DATE(t.purchase_date), e.id, e.title, e.event_date
ORDER BY sale_date DESC, daily_revenue DESC
LIMIT 100;

-- ================================================================
-- QUERY 9: Average ticket price by music genre (BONUS)
-- ================================================================
-- Business Value: Understand pricing dynamics across different genres

SELECT 
    e.category AS genre,
    COUNT(DISTINCT e.id) AS total_events,
    COUNT(t.id) AS tickets_sold,
    ROUND(AVG(tt.price), 2) AS avg_ticket_price,
    ROUND(MIN(tt.price), 2) AS min_ticket_price,
    ROUND(MAX(tt.price), 2) AS max_ticket_price,
    SUM(tt.price) AS total_revenue,
    ROUND(AVG(v.capacity), 0) AS avg_venue_capacity,
    ROUND((COUNT(t.id) / COUNT(DISTINCT e.id)), 2) AS avg_tickets_per_event
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
LEFT JOIN venues v ON e.venue_id = v.id
GROUP BY e.category
ORDER BY avg_ticket_price DESC;

-- ================================================================
-- QUERY 10: VIP vs General Admission revenue comparison (BONUS)
-- ================================================================
-- Business Value: Analyze premium pricing effectiveness and
-- optimize ticket type mix

SELECT 
    e.id,
    e.title AS concert_title,
    e.category AS genre,
    v.name AS venue,
    COUNT(CASE WHEN t.is_vip = TRUE THEN 1 END) AS vip_tickets_sold,
    COUNT(CASE WHEN t.is_vip = FALSE THEN 1 END) AS regular_tickets_sold,
    SUM(CASE WHEN t.is_vip = TRUE THEN tt.price ELSE 0 END) AS vip_revenue,
    SUM(CASE WHEN t.is_vip = FALSE THEN tt.price ELSE 0 END) AS regular_revenue,
    ROUND(
        (SUM(CASE WHEN t.is_vip = TRUE THEN tt.price ELSE 0 END) / 
        NULLIF(SUM(tt.price), 0)) * 100, 2
    ) AS vip_revenue_percentage,
    ROUND(AVG(CASE WHEN t.is_vip = TRUE THEN tt.price END), 2) AS avg_vip_price,
    ROUND(AVG(CASE WHEN t.is_vip = FALSE THEN tt.price END), 2) AS avg_regular_price
FROM events e
JOIN venues v ON e.venue_id = v.id
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
GROUP BY e.id, e.title, e.category, v.name
HAVING vip_tickets_sold > 0 OR regular_tickets_sold > 0
ORDER BY vip_revenue DESC
LIMIT 20;

-- ================================================================
-- ADDITIONAL USEFUL QUERIES
-- ================================================================

-- BONUS: Promo code effectiveness analysis
SELECT 
    pc.code AS promo_code,
    pc.discount_percent,
    pc.discount_amount,
    pc.uses_count AS times_used,
    pc.max_uses,
    COUNT(p.id) AS associated_payments,
    SUM(p.amount) AS total_sales_with_promo,
    SUM(
        CASE 
            WHEN pc.discount_percent > 0 THEN p.amount * (pc.discount_percent / 100)
            WHEN pc.discount_amount > 0 THEN pc.discount_amount
            ELSE 0
        END
    ) AS total_discount_given,
    ROUND(AVG(p.amount), 2) AS avg_order_value
FROM promo_codes pc
LEFT JOIN payments p ON pc.id = p.promo_code_id AND p.status = 'completed'
WHERE pc.active = TRUE
GROUP BY pc.id, pc.code, pc.discount_percent, pc.discount_amount, pc.uses_count, pc.max_uses
ORDER BY times_used DESC;

-- BONUS: Upcoming concerts with low ticket sales (need marketing boost)
SELECT 
    e.id,
    e.title,
    e.event_date,
    e.category,
    v.name AS venue,
    v.capacity,
    COUNT(t.id) AS tickets_sold,
    ROUND((COUNT(t.id) / v.capacity) * 100, 2) AS capacity_filled_percent,
    DATEDIFF(e.event_date, CURDATE()) AS days_until_event
FROM events e
JOIN venues v ON e.venue_id = v.id
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'reserved')
WHERE e.status = 'upcoming'
AND e.event_date > CURDATE()
GROUP BY e.id, e.title, e.event_date, e.category, v.name, v.capacity
HAVING capacity_filled_percent < 50
AND days_until_event < 60
ORDER BY days_until_event ASC;

-- ================================================================
-- REPORTING VIEWS
-- ================================================================

-- Create a comprehensive sales dashboard view
CREATE OR REPLACE VIEW sales_dashboard AS
SELECT 
    DATE(p.payment_date) AS sale_date,
    COUNT(DISTINCT p.id) AS total_transactions,
    COUNT(pt.ticket_id) AS total_tickets,
    SUM(p.amount) AS daily_revenue,
    COUNT(DISTINCT p.attendee_id) AS unique_customers,
    ROUND(AVG(p.amount), 2) AS avg_transaction_value,
    COUNT(CASE WHEN p.promo_code_id IS NOT NULL THEN 1 END) AS promo_code_uses
FROM payments p
LEFT JOIN payment_tickets pt ON p.id = pt.payment_id
WHERE p.status = 'completed'
GROUP BY DATE(p.payment_date)
ORDER BY sale_date DESC;

-- Query the dashboard
SELECT * FROM sales_dashboard
WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY sale_date DESC;
