"use strict";
exports.__esModule = true;
var TagType;
(function (TagType) {
    TagType["Descriptor"] = "DESCRIPTOR";
    TagType["List"] = "LIST";
})(TagType = exports.TagType || (exports.TagType = {}));
var BaseScopes;
(function (BaseScopes) {
    BaseScopes["Public"] = "PUBLIC";
})(BaseScopes = exports.BaseScopes || (exports.BaseScopes = {}));
var TagQueryOrder;
(function (TagQueryOrder) {
    TagQueryOrder["DisplayName"] = "DISPLAY_NAME";
    TagQueryOrder["CreatedAt"] = "CREATED_AT";
})(TagQueryOrder = exports.TagQueryOrder || (exports.TagQueryOrder = {}));
var ReactionType;
(function (ReactionType) {
    ReactionType["Star"] = "STAR";
    ReactionType["Flag"] = "FLAG";
})(ReactionType = exports.ReactionType || (exports.ReactionType = {}));
var ChartType;
(function (ChartType) {
    ChartType["Chord"] = "CHORD";
    ChartType["Progression"] = "PROGRESSION";
})(ChartType = exports.ChartType || (exports.ChartType = {}));
var Note;
(function (Note) {
    Note["C"] = "C";
    Note["D"] = "D";
    Note["E"] = "E";
    Note["F"] = "F";
    Note["G"] = "G";
    Note["A"] = "A";
    Note["B"] = "B";
    Note["Cb"] = "Cb";
    Note["Db"] = "Db";
    Note["Eb"] = "Eb";
    Note["Fb"] = "Fb";
    Note["Gb"] = "Gb";
    Note["Ab"] = "Ab";
    Note["Bb"] = "Bb";
    Note["Cs"] = "Cs";
    Note["Ds"] = "Ds";
    Note["Es"] = "Es";
    Note["Fs"] = "Fs";
    Note["Gs"] = "Gs";
    Note["As"] = "As";
    Note["Bs"] = "Bs";
})(Note = exports.Note || (exports.Note = {}));
var ChartQuality;
(function (ChartQuality) {
    ChartQuality["Major"] = "MAJOR";
    ChartQuality["Minor"] = "MINOR";
    ChartQuality["Sus"] = "SUS";
    ChartQuality["Diminished"] = "DIMINISHED";
    ChartQuality["Augmented"] = "AUGMENTED";
})(ChartQuality = exports.ChartQuality || (exports.ChartQuality = {}));
var ExtensionType;
(function (ExtensionType) {
    ExtensionType["Sus"] = "SUS";
    ExtensionType["Sharp"] = "SHARP";
    ExtensionType["Flat"] = "FLAT";
    ExtensionType["Plain"] = "PLAIN";
})(ExtensionType = exports.ExtensionType || (exports.ExtensionType = {}));
var ChartQueryOrder;
(function (ChartQueryOrder) {
    ChartQueryOrder["ThumbsUp"] = "THUMBS_UP";
    ChartQueryOrder["CreatedAt"] = "CREATED_AT";
})(ChartQueryOrder = exports.ChartQueryOrder || (exports.ChartQueryOrder = {}));
var UserQueryOrder;
(function (UserQueryOrder) {
    UserQueryOrder["CreatedBy"] = "CREATED_BY";
    UserQueryOrder["Username"] = "USERNAME";
})(UserQueryOrder = exports.UserQueryOrder || (exports.UserQueryOrder = {}));
var ErrorType;
(function (ErrorType) {
    ErrorType["Unauthenticated"] = "UNAUTHENTICATED";
    ErrorType["ChartNotFound"] = "CHART_NOT_FOUND";
    ErrorType["InvalidTagQueryScopeError"] = "INVALID_TAG_QUERY_SCOPE_ERROR";
    ErrorType["InvalidTagScopeError"] = "INVALID_TAG_SCOPE_ERROR";
    ErrorType["InvalidChartTagError"] = "INVALID_CHART_TAG_ERROR";
    ErrorType["InvalidChartScope"] = "INVALID_CHART_SCOPE";
    ErrorType["InvalidChartReaction"] = "INVALID_CHART_REACTION";
    ErrorType["Unhandled"] = "UNHANDLED";
    ErrorType["ForbiddenResourceOperation"] = "FORBIDDEN_RESOURCE_OPERATION";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
