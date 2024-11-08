export enum GameType {
  OFFLINE = "OFFLINE",
  SINGLE_DEVICE = "SINGLE_DEVICE",
  LOCAL_MULTIPLAYER = "LOCAL_MULTIPLAYER",
  ONLINE_MULTIPLAYER = "ONLINE_MULTIPLAYER",
}

export enum WordStatus {
  PENDING = "PENDING",
  CORRECT = "CORRECT",
  WRONG = "WRONG",
  SKIPPED = "SKIPPED",
}

export enum PlayerRole {
  GUESSER = "GUESSER",
  HINT_GIVER = "HINT_GIVER",
  LOCAL_PLAYER = "LOCAL_PLAYER",
}

export enum GameStatus {
  WAITING = "WAITING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum Language{
  IT = "IT",
  EN = "EN"
}