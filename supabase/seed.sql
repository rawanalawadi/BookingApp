-- Seed consultants
insert into public.consultants (id, name, specialty, bio, avatar_url, hourly_rate, rating, review_count, tags, offers_online, offers_in_person)
values
  (
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Dr. Sarah Al-Mansour',
    'Business Strategy',
    'With over 15 years of experience advising Fortune 500 companies and startups across the GCC region, Dr. Sarah specialises in growth strategy, market entry, and organisational transformation.',
    'https://api.dicebear.com/7.x/personas/svg?seed=sarah',
    350.00, 4.9, 128,
    ARRAY['Strategy', 'Growth', 'GCC Markets'],
    true, true
  ),
  (
    'a1b2c3d4-0000-0000-0000-000000000002',
    'Khalid Al-Rashidi',
    'Legal & Compliance',
    'Khalid is a licensed commercial lawyer specialising in Saudi and regional compliance, contract law, and corporate governance. He has advised over 200 companies on regulatory matters.',
    'https://api.dicebear.com/7.x/personas/svg?seed=khalid',
    420.00, 4.7, 95,
    ARRAY['Legal', 'Compliance', 'Contracts'],
    true, false
  ),
  (
    'a1b2c3d4-0000-0000-0000-000000000003',
    'Nour Hassan',
    'Financial Planning',
    'Nour is a certified financial planner (CFP) with deep expertise in personal wealth management, investment portfolios, and retirement planning tailored to the Saudi market.',
    'https://api.dicebear.com/7.x/personas/svg?seed=nour',
    300.00, 4.8, 210,
    ARRAY['Finance', 'Investment', 'Wealth Management'],
    true, true
  ),
  (
    'a1b2c3d4-0000-0000-0000-000000000004',
    'Ahmed Bin Saleh',
    'Technology & Digital Transformation',
    'Ahmed leads digital transformation programmes for large enterprises. His expertise spans cloud architecture, AI adoption, and building high-performance engineering teams.',
    'https://api.dicebear.com/7.x/personas/svg?seed=ahmed',
    380.00, 4.6, 74,
    ARRAY['Technology', 'AI', 'Cloud', 'Digital'],
    true, false
  ),
  (
    'a1b2c3d4-0000-0000-0000-000000000005',
    'Layla Al-Otaibi',
    'Human Resources & Talent',
    'Layla is an HR consultant and executive coach who has helped over 50 organisations build talent acquisition strategies, culture frameworks, and leadership development programmes.',
    'https://api.dicebear.com/7.x/personas/svg?seed=layla',
    280.00, 4.9, 163,
    ARRAY['HR', 'Talent', 'Culture', 'Coaching'],
    true, true
  );

-- Seed availability (Sun–Thu, 9am–5pm, 60-min slots)
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

-- Dr. Sarah Al-Mansour: Sun–Thu 09:00–17:00
insert into public.consultant_availability (consultant_id, day_of_week, start_time, end_time, slot_duration_minutes)
select 'a1b2c3d4-0000-0000-0000-000000000001', d, '09:00', '17:00', 60
from generate_series(0, 4) as d;

-- Khalid Al-Rashidi: Sun–Wed 10:00–15:00
insert into public.consultant_availability (consultant_id, day_of_week, start_time, end_time, slot_duration_minutes)
select 'a1b2c3d4-0000-0000-0000-000000000002', d, '10:00', '15:00', 60
from generate_series(0, 3) as d;

-- Nour Hassan: Mon–Thu 08:00–16:00
insert into public.consultant_availability (consultant_id, day_of_week, start_time, end_time, slot_duration_minutes)
select 'a1b2c3d4-0000-0000-0000-000000000003', d, '08:00', '16:00', 60
from generate_series(1, 4) as d;

-- Ahmed Bin Saleh: Mon, Wed, Thu 14:00–20:00
insert into public.consultant_availability (consultant_id, day_of_week, start_time, end_time, slot_duration_minutes)
values
  ('a1b2c3d4-0000-0000-0000-000000000004', 1, '14:00', '20:00', 60),
  ('a1b2c3d4-0000-0000-0000-000000000004', 3, '14:00', '20:00', 60),
  ('a1b2c3d4-0000-0000-0000-000000000004', 4, '14:00', '20:00', 60);

-- Layla Al-Otaibi: Sun–Thu 09:00–18:00
insert into public.consultant_availability (consultant_id, day_of_week, start_time, end_time, slot_duration_minutes)
select 'a1b2c3d4-0000-0000-0000-000000000005', d, '09:00', '18:00', 60
from generate_series(0, 4) as d;
