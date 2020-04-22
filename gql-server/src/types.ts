export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ConstraintString: any;
  ConstraintNumber: any;
};



export enum TagType {
  Descriptor = 'DESCRIPTOR',
  List = 'LIST'
}

export type TagBase = {
  displayName: Scalars['String'];
  scope: Scalars['String'];
  tagType: TagType;
};

export type Tag = TagBase & {
   __typename?: 'Tag';
  id: Scalars['Int'];
  munge: Scalars['String'];
  displayName: Scalars['String'];
  createdBy: Scalars['String'];
  createdAt: Scalars['String'];
  scope: Scalars['String'];
  password: Scalars['String'];
  tagType: TagType;
};

export type TagNew = {
  displayName: Scalars['String'];
  tagType: TagType;
  scope: Scalars['String'];
};

export enum BaseScopes {
  Public = 'PUBLIC'
}

export enum TagQueryOrder {
  DisplayName = 'DISPLAY_NAME',
  CreatedAt = 'CREATED_AT'
}

export type TagQuery = {
  displayName?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  tagTypes: Array<TagType>;
  scopes: Array<Scalars['String']>;
  order?: Maybe<TagQueryOrder>;
  asc?: Maybe<Scalars['Boolean']>;
  after?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export enum ReactionType {
  Star = 'STAR',
  Flag = 'FLAG'
}

export type Reaction = {
   __typename?: 'Reaction';
  chartID: Scalars['Int'];
  reactionType: ReactionType;
  createdBy: Scalars['String'];
  createdAt: Scalars['String'];
};

export type ReactionNew = {
  chartID: Scalars['Int'];
  uid: Scalars['String'];
  reactionType: ReactionType;
};

export enum ChartType {
  Chord = 'CHORD',
  Progression = 'PROGRESSION'
}

export type ChartBase = {
  audioURL: Scalars['String'];
  hint?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  abc: Scalars['String'];
  tags: Array<Tag>;
  scope: Scalars['String'];
  chartType: ChartType;
  bassNote: Scalars['String'];
  root: Note;
  quality: ChartQuality;
  extensions?: Maybe<Array<Extension>>;
};

export type ReactionCounts = {
   __typename?: 'ReactionCounts';
  stars: Scalars['Int'];
  flags: Scalars['Int'];
};

export type Chart = ChartBase & {
   __typename?: 'Chart';
  id: Scalars['Int'];
  audioURL: Scalars['String'];
  imageURL?: Maybe<Scalars['String']>;
  hint?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  abc: Scalars['String'];
  tags: Array<Tag>;
  scope: Scalars['String'];
  chartType: ChartType;
  bassNote: Scalars['String'];
  root: Note;
  quality: ChartQuality;
  extensions?: Maybe<Array<Extension>>;
  reactionCounts: ReactionCounts;
  userReactionType?: Maybe<ReactionType>;
  createdAt: Scalars['String'];
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['String']>;
};

export type ChartNew = {
  audioURL: Scalars['String'];
  imageURL?: Maybe<Scalars['String']>;
  hint?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  abc: Scalars['String'];
  scope: Scalars['String'];
  chartType: ChartType;
  bassNote: Scalars['String'];
  root: Note;
  quality: ChartQuality;
  extensionIDs?: Maybe<Array<Scalars['Int']>>;
  tags: Array<TagNew>;
};

export enum Note {
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  A = 'A',
  B = 'B',
  Cb = 'Cb',
  Db = 'Db',
  Eb = 'Eb',
  Fb = 'Fb',
  Gb = 'Gb',
  Ab = 'Ab',
  Bb = 'Bb',
  Cs = 'Cs',
  Ds = 'Ds',
  Es = 'Es',
  Fs = 'Fs',
  Gs = 'Gs',
  As = 'As',
  Bs = 'Bs'
}

export enum ChartQuality {
  Major = 'MAJOR',
  Minor = 'MINOR',
  Sus = 'SUS',
  Diminished = 'DIMINISHED',
  Augmented = 'AUGMENTED'
}

export enum ExtensionType {
  Sus = 'SUS',
  Sharp = 'SHARP',
  Flat = 'FLAT',
  Plain = 'PLAIN'
}

export type ExtensionNew = {
   __typename?: 'ExtensionNew';
  extensionType: ExtensionType;
  degree: Scalars['Int'];
};

export type Extension = {
   __typename?: 'Extension';
  id: Scalars['Int'];
  extensionType: ExtensionType;
  degree: Scalars['Int'];
};

export type ChartUpdate = {
  id: Scalars['Int'];
  audioURL?: Maybe<Scalars['String']>;
  bassNote?: Maybe<Note>;
  root?: Maybe<Note>;
  quality?: Maybe<ChartQuality>;
  hint?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  abc?: Maybe<Scalars['String']>;
  imageURL?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['String']>;
};

export enum ChartQueryOrder {
  ThumbsUp = 'THUMBS_UP',
  CreatedAt = 'CREATED_AT'
}

export type ChartQuery = {
  id?: Maybe<Scalars['Int']>;
  tagIDs?: Maybe<Array<Scalars['Int']>>;
  chartTypes: Array<ChartType>;
  after?: Maybe<Scalars['Int']>;
  order?: Maybe<ChartQueryOrder>;
  asc?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
};

export type UserBase = {
  username: Scalars['String'];
};

export type User = UserBase & {
   __typename?: 'User';
  uid: Scalars['String'];
  username: Scalars['String'];
  createdAt: Scalars['String'];
};

export type UserNew = {
  username: Scalars['String'];
};

export type UserUpdate = {
  username: Scalars['String'];
};

export enum UserQueryOrder {
  CreatedBy = 'CREATED_BY',
  Username = 'USERNAME'
}

export type UserQuery = {
  uid?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  order?: Maybe<UserQueryOrder>;
  asc?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
};

export enum ErrorType {
  Unauthenticated = 'UNAUTHENTICATED',
  ChartNotFound = 'CHART_NOT_FOUND',
  InvalidTagQueryScopeError = 'INVALID_TAG_QUERY_SCOPE_ERROR',
  InvalidTagScopeError = 'INVALID_TAG_SCOPE_ERROR',
  InvalidChartTagError = 'INVALID_CHART_TAG_ERROR',
  InvalidChartScope = 'INVALID_CHART_SCOPE',
  InvalidChartReaction = 'INVALID_CHART_REACTION',
  Unhandled = 'UNHANDLED',
  ForbiddenResourceOperation = 'FORBIDDEN_RESOURCE_OPERATION'
}

export type ErrorException = {
   __typename?: 'ErrorException';
  stacktrace?: Maybe<Array<Scalars['String']>>;
};

export type ErrorExtensions = {
   __typename?: 'ErrorExtensions';
  msgArgs?: Maybe<Array<Scalars['String']>>;
  code: ErrorType;
  exception?: Maybe<ErrorException>;
};

export type Query = {
   __typename?: 'Query';
  me: User;
  users: Array<User>;
  charts: Array<Chart>;
  tags: Array<Tag>;
  extensions: Array<Extension>;
};


export type QueryUsersArgs = {
  query: UserQuery;
};


export type QueryChartsArgs = {
  query: ChartQuery;
};


export type QueryTagsArgs = {
  query: TagQuery;
};

export type Empty = {
   __typename?: 'Empty';
  empty?: Maybe<Scalars['Boolean']>;
};

export type Mutation = {
   __typename?: 'Mutation';
  createUser?: Maybe<User>;
  updateUser?: Maybe<User>;
  deleteUser?: Maybe<Empty>;
  react?: Maybe<Chart>;
  createChart?: Maybe<Chart>;
  updateChart?: Maybe<Chart>;
  deleteChart?: Maybe<Empty>;
  addExtensions?: Maybe<Chart>;
  removeExtensions?: Maybe<Chart>;
  createTags: Array<Tag>;
  deleteTag?: Maybe<Empty>;
  addTags?: Maybe<Chart>;
  unTag?: Maybe<Chart>;
};


export type MutationCreateUserArgs = {
  newUser: UserNew;
};


export type MutationUpdateUserArgs = {
  userUpdate: UserUpdate;
};


export type MutationReactArgs = {
  reactionNew?: Maybe<ReactionNew>;
};


export type MutationCreateChartArgs = {
  chartNew: ChartNew;
};


export type MutationUpdateChartArgs = {
  chartUpdate: ChartUpdate;
};


export type MutationDeleteChartArgs = {
  chartID: Scalars['Int'];
};


export type MutationAddExtensionsArgs = {
  chartID: Scalars['Int'];
  extensionIDs: Array<Scalars['Int']>;
};


export type MutationRemoveExtensionsArgs = {
  chartID: Scalars['Int'];
  extensionIDs: Array<Scalars['Int']>;
};


export type MutationCreateTagsArgs = {
  tagNews: Array<TagNew>;
};


export type MutationDeleteTagArgs = {
  tagID: Scalars['Int'];
};


export type MutationAddTagsArgs = {
  chartID: Scalars['Int'];
  tags: Array<TagNew>;
};


export type MutationUnTagArgs = {
  chartID: Scalars['Int'];
  tagID: Scalars['Int'];
};

