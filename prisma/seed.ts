import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("test1234", 10);

  const rahul = await prisma.user.upsert({
    where: { phone: "+919876543210" },
    update: {},
    create: {
      name: "Rahul Sharma",
      phone: "+919876543210",
      passwordHash,
      rating: 4.8,
      totalDeliveries: 2,
      totalEarned: 70,
    },
  });

  const priya = await prisma.user.upsert({
    where: { phone: "+919876543211" },
    update: {},
    create: {
      name: "Priya",
      phone: "+919876543211",
      passwordHash,
    },
  });

  const amit = await prisma.user.upsert({
    where: { phone: "+919876543212" },
    update: {},
    create: {
      name: "Amit",
      phone: "+919876543212",
      passwordHash,
    },
  });

  const community = await prisma.community.upsert({
    where: { code: "BLOCKB2024" },
    update: {},
    create: {
      name: "Hostel Block B",
      code: "BLOCKB2024",
      gateLocation: "Main Gate, Near Security",
      createdById: rahul.id,
    },
  });

  for (const user of [rahul, priya, amit]) {
    await prisma.membership.upsert({
      where: {
        userId_communityId: { userId: user.id, communityId: community.id },
      },
      update: {},
      create: {
        userId: user.id,
        communityId: community.id,
        room:
          user.id === priya.id
            ? "Room 204, Block B"
            : user.id === amit.id
              ? "Room 112, Block B"
              : "Room 101, Block B",
      },
    });
  }

  const existing = await prisma.pickupRequest.count({ where: { communityId: community.id } });
  if (existing === 0) {
    await prisma.pickupRequest.createMany({
      data: [
        {
          requesterId: priya.id,
          communityId: community.id,
          foodApp: "swiggy",
          restaurantName: "Domino's Pizza",
          orderDetails: "2x Margherita, OTP: 4821",
          pickupLocation: "Main Gate",
          dropLocation: "Room 204, Block B",
          rewardAmount: 30,
          status: "open",
        },
        {
          requesterId: amit.id,
          communityId: community.id,
          foodApp: "zomato",
          restaurantName: "Burger King",
          pickupLocation: "Side Gate",
          dropLocation: "Room 112, Block B",
          rewardAmount: 40,
          status: "open",
        },
      ],
    });
  }

  console.log("Seeded users:");
  console.log("  Rahul  +919876543210  test1234  (runner)");
  console.log("  Priya  +919876543211  test1234  (poster)");
  console.log("  Amit   +919876543212  test1234");
  console.log("Community code: BLOCKB2024");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
