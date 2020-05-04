import { NavigationState, PartialState } from "@react-navigation/native";

export declare namespace ChordClubShim {

  interface Navigation {
    navigate<RouteName extends string>(...args: [RouteName] | [RouteName, object | undefined]): void;
    navigate<RouteName_1 extends string>(route: {
        key: string;
        params?: object | undefined;
    } | {
        name: RouteName_1;
        key?: string | undefined;
        params: object | undefined;
    }): void;
    reset(state: NavigationState | PartialState<NavigationState>): void;
    goBack(): void;
    isFocused(): boolean;
    canGoBack(): boolean;
  }

}
