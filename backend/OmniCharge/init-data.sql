-- ================== USER SERVICE DB ==================
-- Insert Operators
INSERT INTO operatorentity (id, name) VALUES 
(1, 'Jio'),
(2, 'Airtel'),
(3, 'Vodafone'),
(4, 'BSNL');

-- Insert Plans
INSERT INTO planentity (id, amount, validity, description, operator_id) VALUES 
(1, 149, '28 days', 'Jio Basic Plan - 2GB/day', 1),
(2, 299, '56 days', 'Jio Premium Plan - 3GB/day', 1),
(3, 99, '28 days', 'Airtel Basic Plan - 1.5GB/day', 2),
(4, 199, '28 days', 'Vodafone Plan - 2GB/day', 3),
(5, 79, '28 days', 'BSNL Plan - 1GB/day', 4);

-- Insert Users (Password: Hashed with bcrypt - "password123")
-- Note: Use encoded passwords from your auth service
INSERT INTO userentity (user_id, name, email, contact_no, password, role) VALUES 
(1, 'Raj Patel', 'raj@example.com', '9876543210', '$2a$10$slYQmyNdGzin7olVN3p5Be7DQH4mj8W/qUSTyZKx1eZQzVH37vU/i', 'USER'),
(2, 'Priya Sharma', 'priya@example.com', '9876543211', '$2a$10$slYQmyNdGzin7olVN3p5Be7DQH4mj8W/qUSTyZKx1eZQzVH37vU/i', 'USER'),
(3, 'Admin User', 'admin@example.com', '9876543212', '$2a$10$slYQmyNdGzin7olVN3p5Be7DQH4mj8W/qUSTyZKx1eZQzVH37vU/i', 'ADMIN');

-- ================== RECHARGE PROCESSING DB ==================
-- Note: Run in rechargeprocessingdb
-- \c rechargeprocessingdb

-- Insert Recharges
-- INSERT INTO recharge (id, status, user_id, plan_id) VALUES 
-- (1, 'SUCCESS', 1, 1),
-- (2, 'PENDING', 2, 3),
-- (3, 'FAILED', 1, 2);

-- ================== PAYMENT SERVICE DB ==================
-- Note: Run in paymentservicedb
-- \c paymentservicedb

-- Insert Transactions
-- INSERT INTO transaction (transaction_id, amount, status, timestamp, payment_method, recharge_id, user_id, user_email, user_contact_no, razorpay_order_id, razorpay_payment_id) VALUES 
-- (gen_random_uuid(), 149.00, 'SUCCESS', NOW(), 'CARD', 1, 1, 'raj@example.com', '9876543210', 'order_123', 'pay_123'),
-- (gen_random_uuid(), 199.00, 'PENDING', NOW(), 'UPI', 2, 2, 'priya@example.com', '9876543211', 'order_124', NULL);

-- ================== OPERATOR PLAN DB ==================
-- Note: Run in operatorPlan
-- \c operatorPlan

-- Note: Operators and Plans are already inserted above in first section
