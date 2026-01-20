const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.DATABASE_URL || 'file:wedding.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function seedTasks() {
  // Clear existing tasks
  await client.execute('DELETE FROM tasks');

  const tasks = [
    // ===== IMMEDIATELY (Jan 2026) =====
    { title: 'Set total wedding budget', description: 'Discuss with families what everyone can contribute. This determines everything else.', dueDate: '2026-01-31', priority: 'high', category: 'Budget' },
    { title: 'Create shared planning folder', description: 'Google Drive or Dropbox for contracts, inspiration photos, vendor info. Share with partner and key family.', dueDate: '2026-01-31', priority: 'medium', category: 'Planning' },
    { title: 'Research Mumbai wedding planners', description: 'Critical for destination wedding from California. Get 3-5 quotes. Ask for references from recent weddings.', dueDate: '2026-02-10', priority: 'high', category: 'Vendors' },
    { title: 'Draft initial guest list', description: 'Separate into: Must invite, Should invite, Maybe. Note who is traveling from US vs Panama vs already in India.', dueDate: '2026-02-15', priority: 'high', category: 'Guests' },
    { title: 'Decide wedding style/vibe', description: 'Traditional Indian, fusion, modern? This affects venue, decor, and vendor choices.', dueDate: '2026-02-15', priority: 'high', category: 'Planning' },

    // ===== 12 MONTHS OUT (Feb 2026) =====
    { title: 'Book Mumbai wedding planner/coordinator', description: 'Sign contract. They will be your eyes and ears on the ground. Essential for remote planning.', dueDate: '2026-02-28', priority: 'high', category: 'Vendors' },
    { title: 'Research venue options in Mumbai', description: 'Hotels (Taj, Oberoi, JW Marriott), banquet halls, or heritage venues? Need capacity for all 4 events.', dueDate: '2026-03-15', priority: 'high', category: 'Venue' },
    { title: 'Send visa info to US and Panama guests', description: 'Both can get Indian e-visa online easily. Remind everyone passports need 6+ months validity from travel date.', dueDate: '2026-03-15', priority: 'medium', category: 'Guests' },
    { title: 'Plan first India trip for venue visits', description: 'Book flights to Mumbai. Plan to see 4-5 venues in person over 3-4 days.', dueDate: '2026-03-31', priority: 'high', category: 'Travel' },

    // ===== 10-11 MONTHS OUT (Apr 2026) =====
    { title: 'Mumbai trip - tour wedding venues', description: 'See venues in person. Check spaces for Mehendi, Sangeet, Haldi, Wedding, and Reception.', dueDate: '2026-04-15', priority: 'high', category: 'Venue' },
    { title: 'Book wedding venue', description: 'Sign contract and pay deposit. Lock in Feb 2-5, 2027 dates for all events.', dueDate: '2026-04-30', priority: 'high', category: 'Venue' },
    { title: 'Book caterer or confirm venue catering', description: 'Food is central to Indian weddings. Ask about menu customization and tasting sessions.', dueDate: '2026-04-30', priority: 'high', category: 'Vendors' },
    { title: 'Research photographers/videographers', description: 'Look for teams experienced in multi-day Indian weddings. Review full wedding galleries, not just highlights.', dueDate: '2026-04-30', priority: 'high', category: 'Vendors' },
    { title: 'Research bridal makeup artists in Mumbai', description: 'Good MUAs book 12+ months ahead for Feb wedding season. Get recommendations from planner.', dueDate: '2026-04-30', priority: 'medium', category: 'Vendors' },

    // ===== 9 MONTHS OUT (May 2026) =====
    { title: 'Book photographer and videographer', description: 'Sign contracts. Confirm coverage for all 4 days of events.', dueDate: '2026-05-15', priority: 'high', category: 'Vendors' },
    { title: 'Book makeup artist and hairstylist', description: 'Need looks for Mehendi, Haldi, Sangeet, Wedding ceremony, and Reception - 5 different looks!', dueDate: '2026-05-15', priority: 'high', category: 'Vendors' },
    { title: 'Start bridal lehenga shopping', description: 'Custom bridal lehenga takes 4-6 months. Research designers - can order from Mumbai or US-based Indian boutiques.', dueDate: '2026-05-31', priority: 'high', category: 'Attire' },
    { title: 'Research DJs and bands for Sangeet', description: 'Sangeet needs great music and MC. Get recommendations and watch videos of past events.', dueDate: '2026-05-31', priority: 'medium', category: 'Vendors' },
    { title: 'Book mehndi artist', description: 'For bridal mehndi and guests during Mehendi ceremony.', dueDate: '2026-05-31', priority: 'medium', category: 'Vendors' },

    // ===== 8 MONTHS OUT (Jun 2026) =====
    { title: 'Finalize guest list with addresses', description: 'Lock in numbers - this affects venue setup, catering counts, hotel blocks. Get mailing addresses for invites.', dueDate: '2026-06-15', priority: 'high', category: 'Guests' },
    { title: 'Book DJ/band for Sangeet and Reception', description: 'Sign contract. Discuss song preferences and any special performances.', dueDate: '2026-06-15', priority: 'medium', category: 'Vendors' },
    { title: 'Book pandit for wedding ceremony', description: 'Discuss ceremony format, duration, and any customs you want to include or skip.', dueDate: '2026-06-30', priority: 'high', category: 'Vendors' },
    { title: 'Design and order wedding invitations', description: 'Traditional printed cards, digital invites, or both? Include travel info for international guests.', dueDate: '2026-06-30', priority: 'medium', category: 'Stationery' },
    { title: 'Start groom outfit shopping', description: 'Sherwani for wedding, kurtas for other events. Custom tailoring takes 6-8 weeks.', dueDate: '2026-06-30', priority: 'medium', category: 'Attire' },

    // ===== 6-7 MONTHS OUT (Jul-Aug 2026) =====
    { title: 'Send Save the Dates', description: 'Critical for US and Panama guests who need to book international flights and take time off work.', dueDate: '2026-07-15', priority: 'high', category: 'Stationery' },
    { title: 'Create travel info guide for international guests', description: 'Visa instructions, recommended flights, what to pack, Mumbai tips, hotel options, currency info.', dueDate: '2026-07-31', priority: 'high', category: 'Guests' },
    { title: 'Book florist/decorator', description: 'Mandap decoration, stage setups, flower arrangements. Each event needs different decor.', dueDate: '2026-07-31', priority: 'high', category: 'Vendors' },
    { title: 'Block hotel rooms for guests', description: 'Negotiate group rate at venue hotel or nearby. Block rooms for US, Panama, and out-of-town Indian guests.', dueDate: '2026-07-31', priority: 'high', category: 'Guests' },
    { title: 'Decide on Sangeet performances', description: 'Who is dancing? Family, friends, couple? Start thinking about songs and choreography.', dueDate: '2026-08-31', priority: 'medium', category: 'Events' },
    { title: 'Book choreographer for Sangeet (if needed)', description: 'If doing elaborate performances, a choreographer helps coordinate remotely via video calls.', dueDate: '2026-08-31', priority: 'low', category: 'Vendors' },

    // ===== 4-5 MONTHS OUT (Sep-Oct 2026) =====
    { title: 'Send formal wedding invitations', description: 'Mail physical invites and/or send digital. Include RSVP deadline and hotel booking info.', dueDate: '2026-09-15', priority: 'high', category: 'Stationery' },
    { title: 'Plan second Mumbai trip for fittings and tastings', description: 'Schedule: menu tasting, bridal fittings, vendor meetings, decor discussions.', dueDate: '2026-09-30', priority: 'high', category: 'Travel' },
    { title: 'Menu tasting with caterer', description: 'Finalize menus for all events. Consider mix of veg/non-veg, and any Panamanian dishes to include?', dueDate: '2026-10-15', priority: 'high', category: 'Vendors' },
    { title: 'First bridal lehenga fitting', description: 'Allow time for alterations. Try with jewelry and shoes.', dueDate: '2026-10-15', priority: 'high', category: 'Attire' },
    { title: 'Finalize decor themes for each event', description: 'Colors, flowers, lighting for Mehendi (colorful), Haldi (yellow), Sangeet (glamorous), Wedding (traditional), Reception (elegant).', dueDate: '2026-10-31', priority: 'medium', category: 'Decor' },
    { title: 'Plan welcome event for traveling guests', description: 'Casual dinner or drinks the night before Mehendi for guests arriving from US/Panama.', dueDate: '2026-10-31', priority: 'medium', category: 'Events' },
    { title: 'Book airport transfers for VIP guests', description: 'Arrange pickup from Mumbai airport for parents, grandparents, wedding party.', dueDate: '2026-10-31', priority: 'medium', category: 'Logistics' },
    { title: 'Practice Sangeet choreography', description: 'Start rehearsing! Coordinate video call practices with wedding party in different locations.', dueDate: '2026-10-31', priority: 'medium', category: 'Events' },

    // ===== 2-3 MONTHS OUT (Nov-Dec 2026) =====
    { title: 'RSVP deadline - follow up with non-responders', description: 'Chase down people who have not responded. Need final headcount.', dueDate: '2026-11-15', priority: 'high', category: 'Guests' },
    { title: 'Plan third Mumbai trip - final walkthrough', description: 'Final venue walkthrough, all vendor confirmations, last fittings.', dueDate: '2026-11-30', priority: 'high', category: 'Travel' },
    { title: 'Bridal makeup and hair trial', description: 'Test your wedding day look. Take photos in natural and artificial light.', dueDate: '2026-11-30', priority: 'high', category: 'Beauty' },
    { title: 'Order wedding rings', description: 'Allow time for sizing and any engraving.', dueDate: '2026-11-30', priority: 'high', category: 'Attire' },
    { title: 'Create seating charts for Reception', description: 'Think about family dynamics, language groups (Spanish speakers together?), and mixing friend groups.', dueDate: '2026-12-15', priority: 'medium', category: 'Guests' },
    { title: 'Confirm all vendor contracts and payments', description: 'Review what is paid, what is due. Confirm arrival times and deliverables.', dueDate: '2026-12-15', priority: 'high', category: 'Vendors' },
    { title: 'Prepare wedding party gifts', description: 'Thank you gifts for bridesmaids, groomsmen, parents from both sides.', dueDate: '2026-12-15', priority: 'low', category: 'Gifts' },
    { title: 'Final bridal outfit fittings', description: 'All outfits for all events - Mehendi, Haldi, Sangeet, Wedding, Reception. Last chance for alterations.', dueDate: '2026-12-31', priority: 'high', category: 'Attire' },
    { title: 'Final groom outfit fittings', description: 'Sherwani and all kurtas fitted and ready.', dueDate: '2026-12-31', priority: 'high', category: 'Attire' },
    { title: 'Break in wedding shoes', description: 'Wear around the house. You will be on your feet for 4 days!', dueDate: '2026-12-31', priority: 'low', category: 'Attire' },
    { title: 'Assemble welcome bags for international guests', description: 'Include itinerary, local SIM cards or WiFi info, snacks, Advil, Indian sweets, thank you note.', dueDate: '2026-12-31', priority: 'low', category: 'Guests' },

    // ===== 1 MONTH OUT (Jan 2027) =====
    { title: 'Fly to Mumbai - arrive early', description: 'Arrive at least 10-14 days before wedding for final prep and jet lag recovery.', dueDate: '2027-01-20', priority: 'high', category: 'Travel' },
    { title: 'Submit final guest count to caterer', description: 'Exact numbers for each event. This is usually the deadline for changes.', dueDate: '2027-01-22', priority: 'high', category: 'Vendors' },
    { title: 'Final walkthrough with venue and planner', description: 'Walk through each event space. Confirm setup, timing, flow.', dueDate: '2027-01-23', priority: 'high', category: 'Venue' },
    { title: 'Create detailed day-of timelines', description: 'Minute-by-minute schedule for each of the 4 event days. Share with planner, vendors, wedding party.', dueDate: '2027-01-25', priority: 'high', category: 'Planning' },
    { title: 'Reconfirm all vendors', description: 'Call or WhatsApp every vendor. Confirm arrival times, contact numbers, deliverables.', dueDate: '2027-01-25', priority: 'high', category: 'Vendors' },
    { title: 'Pay final vendor balances', description: 'Complete all payments per contract terms. Get receipts.', dueDate: '2027-01-27', priority: 'high', category: 'Budget' },
    { title: 'Distribute timeline to wedding party', description: 'Everyone needs to know where to be and when. Include parents, siblings, key helpers.', dueDate: '2027-01-28', priority: 'high', category: 'Planning' },
    { title: 'Prepare day-of emergency kit', description: 'Safety pins, pain reliever, antacids, stain remover, phone chargers, snacks, tissues, blotting papers.', dueDate: '2027-01-29', priority: 'medium', category: 'Planning' },
    { title: 'Prepare vendor tips in envelopes', description: 'Cash tips labeled for each vendor. Decide amounts based on service quality and local norms.', dueDate: '2027-01-30', priority: 'medium', category: 'Gifts' },
    { title: 'Rehearsal with pandit', description: 'Walk through wedding ceremony. Understand what happens when.', dueDate: '2027-01-31', priority: 'high', category: 'Events' },

    // ===== WEDDING WEEK =====
    { title: 'Welcome arriving international guests', description: 'Greet guests at hotel. Distribute welcome bags. Help with any issues.', dueDate: '2027-02-01', priority: 'medium', category: 'Guests' },
    { title: 'MEHENDI', description: 'Day 1 - Enjoy the Mehendi ceremony! Get beautiful henna designs. Relax with family and friends.', dueDate: '2027-02-02', priority: 'high', category: 'Events' },
    { title: 'SANGEET', description: 'Day 2 - Dance performances and celebration! All those rehearsals pay off tonight.', dueDate: '2027-02-03', priority: 'high', category: 'Events' },
    { title: 'HALDI', description: 'Day 3 morning - Turmeric ceremony. Wear yellow clothes you do not mind getting stained!', dueDate: '2027-02-04', priority: 'high', category: 'Events' },
    { title: 'WEDDING CEREMONY', description: 'Day 3 - The main event! Pheras, vows, becoming officially married.', dueDate: '2027-02-04', priority: 'high', category: 'Events' },
    { title: 'RECEPTION', description: 'Day 4 - Grand celebration with all guests. Dinner, toasts, dancing.', dueDate: '2027-02-05', priority: 'high', category: 'Events' },

    // ===== POST-WEDDING =====
    { title: 'Tip and thank vendors', description: 'Distribute tips. Express gratitude to everyone who made it happen.', dueDate: '2027-02-06', priority: 'medium', category: 'Gifts' },
    { title: 'Return any rented items', description: 'Rented decor, outfits, jewelry, equipment.', dueDate: '2027-02-10', priority: 'medium', category: 'Logistics' },
    { title: 'Send thank you notes', description: 'Handwritten notes especially for those who traveled internationally and gave gifts.', dueDate: '2027-03-15', priority: 'medium', category: 'Stationery' },
    { title: 'Get bridal outfits cleaned and preserved', description: 'Professional cleaning and preservation for your lehenga and other special pieces.', dueDate: '2027-03-15', priority: 'low', category: 'Attire' },
    { title: 'Leave reviews for great vendors', description: 'Google, WedMeGood, or social media reviews help other couples.', dueDate: '2027-03-15', priority: 'low', category: 'Vendors' },
    { title: 'Update name if changing (marriage certificate first)', description: 'Get marriage certificate from India. Then update passport, Social Security, banks, etc.', dueDate: '2027-04-30', priority: 'medium', category: 'Legal' },
  ];

  const insertStmt = `
    INSERT INTO tasks (title, description, due_date, priority, category, completed, created_at)
    VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
  `;

  for (const task of tasks) {
    await client.execute({
      sql: insertStmt,
      args: [task.title, task.description, task.dueDate, task.priority, task.category]
    });
  }

  console.log(`✓ Added ${tasks.length} tasks to your wedding to-do list!`);
  console.log('\nTask breakdown:');

  const categories = {};
  for (const task of tasks) {
    categories[task.category] = (categories[task.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count} tasks`);
  }
}

seedTasks().catch(console.error);
