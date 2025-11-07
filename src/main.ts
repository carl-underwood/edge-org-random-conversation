import "./style.css";
import conversationStore from "./conversationStore";

import Alpine from "alpinejs";

Alpine.store("conversationStore", conversationStore);

Alpine.start();
