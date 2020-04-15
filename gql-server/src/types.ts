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
  Public = 'PUBLIC',
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Instrument = 'INSTRUMENT'
}

export type TagBase = {
  munge: Scalars['String'];
  displayName: Scalars['String'];
  type: TagType;
};

export type Tag = TagBase & {
   __typename?: 'Tag';
  id: Scalars['Int'];
  munge: Scalars['String'];
  displayName: Scalars['String'];
  createdBy: Scalars['String'];
  createdAt: Scalars['String'];
  password: Scalars['String'];
  type: TagType;
};

export type TagNew = {
  munge: Scalars['String'];
  displayName: Scalars['String'];
  type: TagType;
};

export enum TagQueryOrder {
  DisplayName = 'DISPLAY_NAME',
  CreatedAt = 'CREATED_AT'
}

export type TagQuery = {
  displayName: Scalars['String'];
  type?: Maybe<TagType>;
  id?: Maybe<Scalars['Int']>;
  order?: Maybe<TagQueryOrder>;
  asc: Scalars['Boolean'];
  after: Scalars['String'];
  limit: Scalars['Int'];
};

export enum ReactionType {
  Star = 'STAR',
  Flag = 'FLAG'
}

export type Reaction = {
   __typename?: 'Reaction';
  chartID: Scalars['Int'];
  userID: Scalars['Int'];
  reactionType: ReactionType;
  createdAt: Scalars['String'];
};

export type ReactionNew = {
  chartID: Scalars['Int'];
  userID: Scalars['Int'];
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
  public: Scalars['Boolean'];
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
  public: Scalars['Boolean'];
  chartType: ChartType;
  bassNote: Scalars['String'];
  root: Note;
  quality: ChartQuality;
  extensions?: Maybe<Array<Extension>>;
  reactionCounts: ReactionCounts;
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
  public: Scalars['Boolean'];
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

export type Extension = {
   __typename?: 'Extension';
  id: Scalars['Int'];
  extensionType?: Maybe<ExtensionType>;
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
  public?: Maybe<Scalars['Boolean']>;
};

export enum ChartQueryOrder {
  ThumbsUp = 'THUMBS_UP',
  CreatedAt = 'CREATED_AT'
}

export type ChartQuery = {
  id: Scalars['Int'];
  tags: Array<Scalars['String']>;
  chartType: ChartType;
  after: Scalars['String'];
  order?: Maybe<ChartQueryOrder>;
  asc: Scalars['Boolean'];
  limit: Scalars['Int'];
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
  userUID: Scalars['String'];
  username: Scalars['String'];
  after: Scalars['String'];
  order?: Maybe<UserQueryOrder>;
  asc: Scalars['Boolean'];
  limit: Scalars['Int'];
};

export enum ErrorType {
  Unauthenticated = 'UNAUTHENTICATED',
  ChartNotFound = 'CHART_NOT_FOUND',
  Unhandled = 'UNHANDLED'
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
  createAccount?: Maybe<User>;
  updateAccount?: Maybe<User>;
  deleteAccount?: Maybe<Empty>;
  react?: Maybe<Chart>;
  createChart?: Maybe<Chart>;
  updateChart?: Maybe<Chart>;
  deleteChart?: Maybe<Empty>;
  addExtensions?: Maybe<Chart>;
  removeExtensions?: Maybe<Chart>;
  addTags?: Maybe<Chart>;
  unTag?: Maybe<Chart>;
};


export type MutationCreateAccountArgs = {
  newUser: UserNew;
};


export type MutationUpdateAccountArgs = {
  userUpdate: UserUpdate;
};


export type MutationDeleteAccountArgs = {
  userID: Scalars['Int'];
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


export type MutationAddTagsArgs = {
  chartID: Scalars['Int'];
  tags: Array<TagNew>;
};


export type MutationUnTagArgs = {
  chartID: Scalars['Int'];
  tagID: Scalars['String'];
};

