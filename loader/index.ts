import { join, dirname } from "path";
import { writeFile } from "fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { Conversation } from "../src/types.js";

// See https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __dirname = dirname(import.meta.url.replace("file://", ""));

const conversations: Conversation[] = [];

test("load conversations", async ({ page }) => {
  await page.goto("https://www.edge.org/conversations");

  await iteratePages(page);
  await saveConversations();
});

const iteratePages = async (page: Page) => {
  let currentPage = 1;
  while (true) {
    await loadConversationsOnPage(page);

    const nextPageLocator = page.getByRole("link", {
      name: (++currentPage).toString(),
      exact: true,
    });
    if (!(await nextPageLocator.count())) {
      return;
    }

    await nextPageLocator.click();
    await expect(page.locator(".pager-current")).toHaveText(
      currentPage.toString(),
    );
  }
};

const loadConversationsOnPage = async (page: Page) => {
  for (const conversation of await page.locator("tr.conversation").all()) {
    const conversationTitle = conversation.locator(".conversation-title");
    const title = (await conversationTitle.textContent())?.trim();
    if (!title) {
      throw new Error("Encountered conversation with no title!");
    }

    const href = (
      await conversationTitle.locator("a").getAttribute("href")
    )?.trim();
    if (!href) {
      throw new Error(`Could not find url for conversation "${title}"`);
    }

    const image = conversation.getByRole("img");
    const imageSrc = (await image.isVisible())
      ? await image.getAttribute("src")
      : null;

    conversations.push({
      imageSrc,
      topic: (await conversation.locator(".topic").textContent())?.trim() || "",
      title,
      subtitle:
        (await conversation.locator(".sub-title").textContent())?.trim() || "",
      byline: (await conversation.locator(".byline").allTextContents())
        .join(" ")
        .trim(),
      contributors:
        (
          await conversation.locator(".contributor-list").textContent()
        )?.trim() || "",
      url: `https://www.edge.org${href}`,
    });

    console.log(title);
  }
};

const saveConversations = async () => {
  const path = join(__dirname, "../conversations.json");

  await writeFile(path, JSON.stringify(conversations, null, 2));
};
