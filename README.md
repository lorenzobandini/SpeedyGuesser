# **SpeedyGuesser** ⚡

> _"Challenge your friends and find out who's the fastest at guessing! A race of intuition and speed."_  

---

## **Table of Contents** 📚

- [**SpeedyGuesser** ⚡](#speedyguesser-)
  - [**Table of Contents** 📚](#table-of-contents-)
  - [**Project Description**](#project-description)
  - [**How to Use** 🛠️](#how-to-use-️)
  - [**Game Modes** 🎮](#game-modes-)
    - [**Offline Mode**](#offline-mode)
    - [**Single Mode**](#single-mode)
    - [**Local Mode**](#local-mode)
  - [**Technologies Used** 🧰](#technologies-used-)
  - [**Contributions** 🤝](#contributions-)
  - [**License** 📜](#license-)

---

## **Project Description**

**SpeedyGuesser** is an engaging game where two teams compete to guess the most words in the shortest time possible.  
The project is based on **[Create T3 App](https://create.t3.gg/)**, which ensures a scalable and modern architecture for web applications.

- **Current version**: 1.0.0
- **Developer**: Lorenzo Bandini  

---

## **How to Use** 🛠️

_Follow these steps to install and run the project locally._

1. Clone the repository:

   ```bash
   git clone https://github.com/lorenzobandini/speedyguesser.git
   ```

2. Navigate to the project folder:

   ```bash
   cd speedyguesser
   ```

3. Copy the `.env.example` file and customize your `.env`:

   ```bash
   cp .env.example .env
   ```

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Sync the prisma schema with the database:

   ```bash
   npx prisma db push
   ```

6. Populate the database with initial data:

   ```bash
   npx prisma db seed
   ```

7. Start the app in development mode:

   ```bash
   pnpm run dev
   ```

8. (Optional) Open Prisma Studio to manage the database:

   ```bash
   npx prisma studio
   ```

**Note**: SpeedyGuesser is a **Progressive Web App (PWA)** and can be installed on your device for a native experience.

---

## **Game Modes** 🎮

SpeedyGuesser offers three game modes to suit every situation:

### **Offline Mode**

- No authentication required.
- Play on a single device.
- Results are not saved.

### **Single Mode**

- Requires authentication.
- Similar to offline mode, but results are saved.

### **Local Mode**

- Requires authentication.
- Allows playing on multiple devices synchronized in real-time.
- Each player can choose their own role and results are saved.

---

## **Technologies Used** 🧰

**SpeedyGuesser** has been built using a set of modern and performant technologies:

- **TypeScript**: For safer and more readable code.
- **Next.js**: React framework for creating server-rendered web applications.
- **Tailwind CSS**: For fast and responsive design.
- **Prisma**: ORM to interact with the database in a simple way.
- **tRPC**: For type-safe APIs between client and server.
- **PWA**: Supports installation and notifications.

---

## **Contributions** 🤝

Want to contribute?  
Follow these simple steps:

1. Fork the project.
2. Create a branch for your changes:

   ```bash
   git checkout -b feature/new-feature
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add new feature"
   ```

4. Submit a pull request!

---

## **License** 📜

This project is distributed under the **MIT** license.  
See the [LICENSE](./LICENSE) file for more details.
