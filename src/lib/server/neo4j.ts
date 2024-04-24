import neo4j, { type Integer, type Node, type Relationship } from 'neo4j-driver';
import { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } from '$env/static/private';
import type { Category } from '$lib/config';

export const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));

export interface UserProperties {
	email: string;
	token: string;
	lastVote?: string;
}

export type User = Node<Integer, UserProperties>;

export interface EntryProperties extends Record<string, unknown> {
	category: Category;
	title: string;
	description: string;
	link: string;
	group: boolean;
	thumbnail: string;
	number: number;
}

export type Entry = Node<Integer, EntryProperties>;

export interface FeedbackProperties extends Record<string, unknown> {
	token: string;
	userToken: string;
	value: string;
	explicit: boolean;
	validated: boolean;
}

export type Feedback = Node<Integer, FeedbackProperties>;

export interface FlagProperties extends Record<string, unknown> {
	reason: string;
}

export type Flag = Relationship<Integer, FlagProperties>;
