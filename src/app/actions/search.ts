"use server";

import { search as searchData, type SearchResults } from "@/lib/data/search";

export async function searchAll(query: string): Promise<SearchResults> {
  return searchData(query);
}
