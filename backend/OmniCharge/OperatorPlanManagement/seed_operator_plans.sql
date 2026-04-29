INSERT INTO operator_entity (id, name) VALUES
  (1, 'Jio'),
  (2, 'Airtel'),
  (3, 'Vi'),
  (4, 'BSNL'),
  (5, 'MTNL'),
  (6, 'Tata Tele')
ON CONFLICT (name) DO NOTHING;

INSERT INTO plan_entity (id, amount, validity, description, operator_id) VALUES
  (1, 239, '28 days', '1.5GB/day, unlimited calls, 100 SMS/day', 1),
  (2, 479, '56 days', '1.5GB/day, unlimited calls, Jio apps access', 1),
  (13, 749, '84 days', '2GB/day, unlimited calls, Jio apps, OTT bundle', 1),
  (3, 199, '28 days', '1GB/day, unlimited calls, 100 SMS/day', 2),
  (4, 699, '84 days', '2GB/day, unlimited calls, Apollo 24|7 benefits', 2),
  (14, 999, '365 days', '1.5GB/day, unlimited calls, yearly unlimited pack', 2),
  (5, 199, '28 days', '1GB/day, unlimited calls, weekend data rollover', 3),
  (6, 839, '84 days', '2GB/day, unlimited calls, binge all night data', 3),
  (15, 1099, '365 days', '1.5GB/day, unlimited calls, long validity annual pack', 3),
  (7, 107, '35 days', 'Unlimited BSNL to BSNL calls, 1.5GB total data', 4),
  (8, 485, '84 days', '1GB/day, unlimited calls, national roaming', 4),
  (16, 999, '365 days', '2GB/day, unlimited calls, nationwide yearly pack', 4),
  (9, 149, '30 days', 'Talktime pack with SMS and basic data top-up', 5),
  (10, 499, '60 days', 'Voice + data combo with caller tunes access', 5),
  (17, 799, '180 days', 'Talktime plus data combo with six-month validity', 5),
  (11, 299, '28 days', '1.5GB/day, unlimited calls, free incoming roaming', 6),
  (12, 899, '90 days', '2GB/day, unlimited calls, premium support', 6),
  (18, 1299, '365 days', 'Annual unlimited pack with premium support', 6)
ON CONFLICT (id) DO NOTHING;

SELECT setval('operator_entity_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM operator_entity), 1), true);
SELECT setval('plan_entity_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM plan_entity), 1), true);
