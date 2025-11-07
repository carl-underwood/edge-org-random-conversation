import Alpine from "alpinejs";
import type { Conversation } from "./types";
import conversations from "../conversations.json";

const pickRandomConversation = (setInStore = true) => {
  const randomIndex = Math.floor(Math.random() * conversations.length);
  const randomConversation = conversations[randomIndex];

  if (setInStore) {
    const store = Alpine.store("conversationStore");
    store.randomConversation = randomConversation;
  }

  console.log(randomConversation);

  return randomConversation;
};

const conversationStore: {
  randomConversation: Conversation;
  pickRandomConversation: typeof pickRandomConversation;
} = {
  randomConversation: pickRandomConversation(false),
  pickRandomConversation,
};

declare module "alpinejs" {
  interface Stores {
    conversationStore: typeof conversationStore;
  }
}

export default conversationStore;
