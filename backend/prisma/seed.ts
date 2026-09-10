import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROBLEMS = [
  {
    title: 'Parking Lot System',
    difficulty: 'Medium',
    tags: JSON.stringify(['Object Oriented Design', 'Strategy Pattern', 'State Pattern', 'Concurrency']),
    description: `Design a multi-level Parking Lot System that can manage multiple types of vehicles and parking spots across multiple floors.

CORE REQUIREMENTS:
1. Support 3 types of spots: Small (Motorcycle), Compact (Car), Large (Truck/Bus).
2. Spot Allocation: Assign nearest available spot matching vehicle size or larger if preferred.
3. Ticket Generation: Issue an entry ticket with unique ID, timestamp, assigned floor, and spot number.
4. Payment & Pricing Strategy: Support dynamic pricing (e.g., Flat Rate, Hourly Rate, Vehicle-type multiplier). Allow plugging in future pricing algorithms.
5. Real-time Capacity Tracking: Display real-time available spots per floor and per spot type.
6. Payment Gateways: Handle multiple payment methods (Cash, Credit Card, UPI).

EXPECTED DELIVERABLES:
- Class Diagram / Entity Hierarchy (Entities, Interfaces, Enums).
- Responsibility Assignment (SRP explanation for controllers, managers, strategies).
- Design Patterns used and architectural rationales.
- Edge Case & Concurrency strategy (e.g. concurrent spot reservation, race conditions).`,
    constraints: `Must handle 10,000+ vehicles/day. Concurrent spot booking must avoid double allocation. Flexible strategy pattern for pricing.`,
  },
  {
    title: 'Elevator Control System',
    difficulty: 'Hard',
    tags: JSON.stringify(['State Pattern', 'Dispatch Algorithm', 'Concurrency', 'Queue Management']),
    description: `Design a multi-car Elevator Control System for a 50-story commercial skyscraper.

CORE REQUIREMENTS:
1. Multi-Elevator Architecture: Manage N elevators across M floors.
2. Request Types:
   - External Requests: Directional button pressed on a floor (e.g. Floor 12 UP).
   - Internal Requests: Destination floor pressed inside elevator car (e.g. Floor 24).
3. Elevator Car States: Idle, Moving Up, Moving Down, Maintenance, Door Open.
4. Dispatching Strategy: Optimal car allocation algorithm (e.g. SCAN, LOOK, Shortest Seek Time First, Energy Efficient). Support pluggable dispatcher strategies.
5. Door Safety & Emergency Handling: Handle overload sensors, emergency stop, power failure override.
6. Concurrency & Event Handling: Thread-safe state transitions when multiple floors press request buttons simultaneously.

EXPECTED DELIVERABLES:
- Core Entities: ElevatorCar, Controller, DispatchStrategy, Floor, Button, Request.
- State Machine design for ElevatorCar status transitions.
- Concurrency model for real-time dispatch queue processing.
- Explanation of trade-offs in dispatch algorithm choice.`,
    constraints: `50 floors, 8 elevators. Real-time sub-second dispatching decisions under peak morning rush hours.`,
  },
  {
    title: 'Vending Machine System',
    difficulty: 'Easy',
    tags: JSON.stringify(['State Pattern', 'Inventory Management', 'Payment Processing']),
    description: `Design a standalone Vending Machine System that dispenses snacks and drinks upon payment.

CORE REQUIREMENTS:
1. Finite State Machine:
   - IdleState (Waiting for money insertion)
   - HasMoneyState (Money inserted, waiting for product selection)
   - DispensingState (Dispensing item, updating inventory)
   - SoldOutState (Product unavailable)
2. Product & Inventory Management:
   - Each shelf has a code (A1, B2, etc.), product, price, and stock quantity.
3. Payment & Change Return:
   - Accept coins and bills of various denominations.
   - Calculate change to return or handle insufficient payment/refund cancelation.
4. User Cancellation: Allow user to cancel transaction anytime before dispensing and receive exact inserted money back.

EXPECTED DELIVERABLES:
- Explicit State Pattern interface and concrete state implementations.
- Inventory representation and transactional item dispensing.
- Edge case handling for exact change unavailability and refund flows.`,
    constraints: `Atomic dispensing transaction. Machine must never be stuck in invalid state if payment fails.`,
  },
  {
    title: 'Movie Ticket Booking System (BookMyShow)',
    difficulty: 'Hard',
    tags: JSON.stringify(['Locking Strategy', 'Concurrency', 'Payment Integration', 'Database Transactions']),
    description: `Design a Movie Ticket Booking Platform supporting multi-screen cinemas, showtime management, and concurrent seat reservations.

CORE REQUIREMENTS:
1. Entity Model: Cinema, Screen, Seat (Regular, Premium, VIP), Movie, Show, Booking, Payment.
2. Seat Selection & Locking:
   - When a user selects seats, temporary lock them for 10 minutes.
   - If payment completes within 10 mins, confirm booking.
   - If timer expires, automatically release seat locks back to available pool.
3. Concurrency Protection: Ensure NO TWO users can book or lock the exact same seat for the same showtime simultaneously.
4. Flexible Search & Filtering: Search shows by Movie, City, Cinema, Date, Time slot.
5. Pricing Strategy: Dynamic seat pricing based on show timing (Morning vs Night show), day of week, and seat tier.

EXPECTED DELIVERABLES:
- Class Diagram & Data Flow.
- Locking Mechanism (Optimistic vs Pessimistic locking rationale).
- Expiration/Timeout worker design for releasing expired locks.
- Concurrency edge cases and race condition prevention.`,
    constraints: `Prevent double booking under high concurrency (e.g. blockbuster movie ticket opening). 10-minute lock timeout.`,
  },
];

async function main() {
  console.log('Seeding LLD problems database...');

  await prisma.problem.deleteMany();

  for (const prob of PROBLEMS) {
    const created = await prisma.problem.create({
      data: prob,
    });
    console.log(`Seeded problem: ${created.title} (${created.id})`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
