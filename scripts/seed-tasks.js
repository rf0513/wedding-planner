const Database = require('better-sqlite3');
const db = new Database('wedding.db');

// Clear existing tasks
db.prepare('DELETE FROM tasks').run();

const tasks = [
  // ===== IMMEDIATELY (Jan-Feb 2026) =====
  { title: 'Set wedding budget and priorities', description: 'Discuss with partner what matters most - venue, food, photography, etc. Allocate your $80,000 accordingly.', dueDate: '2026-01-31', priority: 'high', category: 'Planning' },
  { title: 'Create shared Google Drive folder', description: 'For contracts, inspiration photos, vendor info, and documents both of you can access.', dueDate: '2026-01-31', priority: 'medium', category: 'Planning' },
  { title: 'Research Mumbai wedding planners', description: 'Since you are in USA, a local planner in Mumbai is essential. Get 3-5 quotes.', dueDate: '2026-02-15', priority: 'high', category: 'Vendors' },
  { title: 'Draft initial guest list', description: 'Start with must-invites. Remember: Indian weddings often have 200-500+ guests!', dueDate: '2026-02-15', priority: 'high', category: 'Guests' },
  { title: 'Decide on wedding style', description: 'Traditional Indian, Indo-Western fusion, or modern? This affects all vendor choices.', dueDate: '2026-02-15', priority: 'high', category: 'Planning' },

  // ===== 12 MONTHS OUT (Feb-Mar 2026) =====
  { title: 'Book Mumbai wedding planner', description: 'Sign contract and pay deposit. They will be your boots on the ground.', dueDate: '2026-02-28', priority: 'high', category: 'Vendors' },
  { title: 'Research and shortlist venues', description: 'Hotels, banquet halls, or destination venues? Need space for all events.', dueDate: '2026-03-15', priority: 'high', category: 'Venue' },
  { title: 'Plan India trip for venue visits', description: 'Book flights to Mumbai to see venues in person. Essential before booking!', dueDate: '2026-03-15', priority: 'high', category: 'Travel' },
  { title: 'Start passport/visa check for guests', description: 'Remind US-based guests to check passport validity (6+ months) and get Indian visas.', dueDate: '2026-03-31', priority: 'medium', category: 'Guests' },

  // ===== 10-11 MONTHS OUT (Mar-Apr 2026) =====
  { title: 'Visit Mumbai - venue tours', description: 'See 3-5 venues in person. Check for Mehendi, Haldi, Sangeet, Ceremony, Reception spaces.', dueDate: '2026-04-15', priority: 'high', category: 'Venue' },
  { title: 'Book wedding venue', description: 'Sign contract and pay deposit (typically 25-50%). Lock in Feb 2-4, 2027 dates.', dueDate: '2026-04-30', priority: 'high', category: 'Venue' },
  { title: 'Research photographers/videographers', description: 'Look for teams experienced in Indian weddings. Review portfolios carefully.', dueDate: '2026-04-30', priority: 'high', category: 'Vendors' },
  { title: 'Book caterer or confirm venue catering', description: 'Food is HUGE in Indian weddings. Taste testing required!', dueDate: '2026-04-30', priority: 'high', category: 'Vendors' },
  { title: 'Research Mumbai makeup artists', description: 'Book early - good MUAs get booked 12+ months ahead for wedding season.', dueDate: '2026-04-30', priority: 'medium', category: 'Vendors' },

  // ===== 9 MONTHS OUT (May 2026) =====
  { title: 'Book photographer and videographer', description: 'Sign contracts. Confirm they can cover all events over 3 days.', dueDate: '2026-05-15', priority: 'high', category: 'Vendors' },
  { title: 'Book makeup artist and hairstylist', description: 'You will need looks for Mehendi, Haldi, Sangeet, Wedding, and Reception!', dueDate: '2026-05-15', priority: 'high', category: 'Vendors' },
  { title: 'Start shopping for bridal lehenga', description: 'Custom bridal wear takes 4-6 months. Visit designers in Mumbai or order from USA.', dueDate: '2026-05-31', priority: 'high', category: 'Attire' },
  { title: 'Research wedding DJs/bands', description: 'Sangeet needs great music! Find DJ or live band for multiple events.', dueDate: '2026-05-31', priority: 'medium', category: 'Vendors' },
  { title: 'Book mehndi artist', description: 'For bride and female guests during Mehendi ceremony.', dueDate: '2026-05-31', priority: 'medium', category: 'Vendors' },

  // ===== 8 MONTHS OUT (Jun 2026) =====
  { title: 'Finalize guest list', description: 'Lock in numbers for venue and catering. This affects everything!', dueDate: '2026-06-15', priority: 'high', category: 'Guests' },
  { title: 'Book DJ/band for events', description: 'Sangeet and Reception entertainment sorted.', dueDate: '2026-06-15', priority: 'medium', category: 'Vendors' },
  { title: 'Order wedding invitations', description: 'Traditional Indian invites or digital? Order/design and get guest addresses.', dueDate: '2026-06-30', priority: 'medium', category: 'Stationery' },
  { title: 'Book pandit/officiant', description: 'For Hindu ceremony rituals. Discuss ceremony preferences.', dueDate: '2026-06-30', priority: 'high', category: 'Vendors' },
  { title: 'Groom outfit shopping', description: 'Sherwani, kurta sets for each event. Custom tailoring takes time.', dueDate: '2026-06-30', priority: 'medium', category: 'Attire' },

  // ===== 6-7 MONTHS OUT (Jul-Aug 2026) =====
  { title: 'Send Save the Dates', description: 'Especially important for US guests who need to plan India travel!', dueDate: '2026-07-15', priority: 'high', category: 'Stationery' },
  { title: 'Book florist/decorator', description: 'Mandap decoration, stage setup, flower arrangements for all events.', dueDate: '2026-07-31', priority: 'high', category: 'Vendors' },
  { title: 'Plan accommodations for guests', description: 'Block hotel rooms near venue. Create info sheet for out-of-town guests.', dueDate: '2026-07-31', priority: 'high', category: 'Guests' },
  { title: 'Research wedding insurance', description: 'Protects against vendor no-shows, weather issues, cancellations.', dueDate: '2026-08-15', priority: 'medium', category: 'Planning' },
  { title: 'Finalize Sangeet performances', description: 'Who is dancing? Start choreography planning with family/friends.', dueDate: '2026-08-31', priority: 'medium', category: 'Events' },
  { title: 'Book henna artist trial', description: 'Test designs before the big day.', dueDate: '2026-08-31', priority: 'low', category: 'Vendors' },

  // ===== 4-5 MONTHS OUT (Sep-Oct 2026) =====
  { title: 'Send formal wedding invitations', description: 'Mail physical invites or send digital ones. Include RSVP deadline.', dueDate: '2026-09-15', priority: 'high', category: 'Stationery' },
  { title: 'Menu tasting with caterer', description: 'Finalize menu for all events. Consider vegetarian/non-veg options.', dueDate: '2026-09-30', priority: 'high', category: 'Vendors' },
  { title: 'Bridal lehenga fittings', description: 'First fitting - allow time for alterations.', dueDate: '2026-09-30', priority: 'high', category: 'Attire' },
  { title: 'Plan welcome bags for guests', description: 'Especially for guests traveling from USA. Include Indian snacks, itinerary, etc.', dueDate: '2026-10-15', priority: 'low', category: 'Guests' },
  { title: 'Book transportation', description: 'Airport pickups, shuttles between hotel and venue for guests.', dueDate: '2026-10-15', priority: 'medium', category: 'Logistics' },
  { title: 'Finalize decor themes per event', description: 'Colors, flowers, lighting for Mehendi, Haldi, Sangeet, Wedding, Reception.', dueDate: '2026-10-31', priority: 'medium', category: 'Decor' },
  { title: 'Sangeet choreography rehearsals', description: 'Practice dance performances with wedding party.', dueDate: '2026-10-31', priority: 'medium', category: 'Events' },

  // ===== 2-3 MONTHS OUT (Nov-Dec 2026) =====
  { title: 'RSVP deadline - follow up', description: 'Chase down non-responders. Finalize headcount.', dueDate: '2026-11-15', priority: 'high', category: 'Guests' },
  { title: 'Final venue walkthrough', description: 'Trip to Mumbai to finalize all details with planner and vendors.', dueDate: '2026-11-30', priority: 'high', category: 'Venue' },
  { title: 'Makeup and hair trial', description: 'Test your wedding day look. Take photos in different lighting.', dueDate: '2026-11-30', priority: 'high', category: 'Beauty' },
  { title: 'Order wedding rings', description: 'If not already done. Allow time for sizing and engraving.', dueDate: '2026-11-30', priority: 'high', category: 'Attire' },
  { title: 'Finalize seating charts', description: 'Who sits where at each event? Consider family dynamics!', dueDate: '2026-12-15', priority: 'medium', category: 'Guests' },
  { title: 'Confirm all vendor contracts', description: 'Review final payments, arrival times, deliverables.', dueDate: '2026-12-15', priority: 'high', category: 'Vendors' },
  { title: 'Prepare wedding party gifts', description: 'Thank you gifts for bridesmaids, groomsmen, parents.', dueDate: '2026-12-15', priority: 'low', category: 'Gifts' },
  { title: 'Break in wedding shoes', description: 'Wear them around the house so they are comfortable for 3 days of events!', dueDate: '2026-12-31', priority: 'low', category: 'Attire' },
  { title: 'Final bridal outfit fittings', description: 'All outfits for all events - last chance for alterations.', dueDate: '2026-12-31', priority: 'high', category: 'Attire' },

  // ===== 1 MONTH OUT (Jan 2027) =====
  { title: 'Fly to Mumbai', description: 'Arrive at least 1-2 weeks before wedding for final prep.', dueDate: '2027-01-20', priority: 'high', category: 'Travel' },
  { title: 'Final guest count to caterer', description: 'Confirm exact numbers for all events.', dueDate: '2027-01-20', priority: 'high', category: 'Vendors' },
  { title: 'Finalize day-of timeline', description: 'Minute-by-minute schedule for each event day.', dueDate: '2027-01-22', priority: 'high', category: 'Planning' },
  { title: 'Confirm all vendor arrival times', description: 'Call/email every vendor to reconfirm.', dueDate: '2027-01-25', priority: 'high', category: 'Vendors' },
  { title: 'Final payments to vendors', description: 'Pay remaining balances as per contracts.', dueDate: '2027-01-25', priority: 'high', category: 'Budget' },
  { title: 'Distribute wedding party timeline', description: 'Everyone should know where to be and when.', dueDate: '2027-01-27', priority: 'high', category: 'Planning' },
  { title: 'Pack wedding day emergency kit', description: 'Safety pins, pain relief, stain remover, phone chargers, snacks, etc.', dueDate: '2027-01-28', priority: 'medium', category: 'Planning' },
  { title: 'Rehearsal dinner', description: 'Practice ceremony with wedding party and pandit.', dueDate: '2027-01-31', priority: 'high', category: 'Events' },
  { title: 'Prepare vendor tips and thank yous', description: 'Cash tips in envelopes, labeled and ready.', dueDate: '2027-01-31', priority: 'medium', category: 'Gifts' },

  // ===== WEDDING WEEK =====
  { title: 'Welcome arriving guests', description: 'Greet guests at hotel, distribute welcome bags.', dueDate: '2027-02-01', priority: 'medium', category: 'Guests' },
  { title: 'Mehendi ceremony', description: 'Day 1 - Enjoy your Mehendi! Get those beautiful henna designs.', dueDate: '2027-02-02', priority: 'high', category: 'Events' },
  { title: 'Haldi ceremony (morning)', description: 'Day 2 AM - Turmeric blessings. Wear clothes you do not mind staining!', dueDate: '2027-02-03', priority: 'high', category: 'Events' },
  { title: 'Vows & Sangeet (evening)', description: 'Day 2 PM - Exchange vows and dance the night away!', dueDate: '2027-02-03', priority: 'high', category: 'Events' },
  { title: 'Wedding ceremony (morning)', description: 'Day 3 AM - The main event! Pheras and becoming officially married.', dueDate: '2027-02-04', priority: 'high', category: 'Events' },
  { title: 'Reception (evening)', description: 'Day 3 PM - Celebrate with all your guests!', dueDate: '2027-02-04', priority: 'high', category: 'Events' },

  // ===== POST-WEDDING =====
  { title: 'Return rented items', description: 'Any rented decor, outfits, or equipment.', dueDate: '2027-02-10', priority: 'medium', category: 'Logistics' },
  { title: 'Send thank you notes', description: 'Handwritten notes to guests, especially those who gave gifts or traveled far.', dueDate: '2027-03-15', priority: 'medium', category: 'Stationery' },
  { title: 'Preserve wedding outfit', description: 'Get bridal lehenga professionally cleaned and preserved.', dueDate: '2027-03-15', priority: 'low', category: 'Attire' },
  { title: 'Review and tip vendors', description: 'Leave Google/social reviews for great vendors.', dueDate: '2027-03-15', priority: 'low', category: 'Vendors' },
  { title: 'Name change paperwork (if applicable)', description: 'Update passport, license, Social Security, banks, etc.', dueDate: '2027-04-30', priority: 'medium', category: 'Legal' },
];

const insert = db.prepare(`
  INSERT INTO tasks (title, description, due_date, priority, category, completed, created_at)
  VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
`);

for (const task of tasks) {
  insert.run(task.title, task.description, task.dueDate, task.priority, task.category);
}

console.log('Added ' + tasks.length + ' tasks to your wedding to-do list!');
db.close();
