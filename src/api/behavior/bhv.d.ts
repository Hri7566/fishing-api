interface IBehaviorValidResponse<State> {
    success: true;

    // shouldRemove: boolean;
    // and?: string;
    state: State;
}

interface IBehaviorErrorResponse {
    success: false;
    err: string;
}

type TBehaviorResponse<State> =
    | IBehaviorValidResponse<State>
    | IBehaviorErrorResponse;

type TBehaviorCallback<Context, State> = (
    context: Context
) => Promise<TBehaviorResponse<State>>;
type TBehavior<Context, State> = Record<
    string,
    TBehaviorCallback<Context, State>
>;
type TBehaviorMap<Context, State> = Map<string, TBehavior<Context, State>>; //Record<string, TBehavior<C>>;

type TBehaviorNamespace = string;
type TBehaviorAction = keyof IBehaviorContextStateDefinitions;
type TBehaviorID = `${TBehaviorNamespace}:${TBehaviorAction}`;

interface IBehaviorDefinition<Context> {
    id: string;
    bhv: TBehavior<Context>;
}

declare interface IBehaviorContextStateDefinitions
    extends Record<Record<{ context: unknown; state: unknown }>> {
    eat: {
        context: {
            id: string;
            part: IPart;
            object: IObject;
            user: User;
        };

        state: {
            shouldRemove: boolean;
            and?: string;
        };
    };

    yeet: {
        context: {
            part: IPart;
        };

        state: {
            shouldRemove: boolean;
            text: string;
        };
    };
}
