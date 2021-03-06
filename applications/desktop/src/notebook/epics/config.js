/* @flow strict */
import { remote } from "electron";
import { actions } from "@nteract/core";
import { readFileObservable, writeFileObservable } from "fs-observable";
import { mapTo, mergeMap, map, switchMap } from "rxjs/operators";
import { ofType } from "redux-observable";
import type { ActionsObservable, StateObservable } from "redux-observable";
import type { AppState } from "@nteract/core";

const path = require("path");

const HOME = remote.app.getPath("home");

export const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

/**
 * An epic that loads the configuration.
 */
export const loadConfigEpic = (action$: ActionsObservable<redux$Action>) =>
  action$.pipe(
    ofType(actions.LOAD_CONFIG),
    switchMap(() =>
      // $FlowFixMe deal with after the typescript migration
      readFileObservable(CONFIG_FILE_PATH).pipe(
        map(data => actions.configLoaded(JSON.parse(data)))
      )
    )
  );

/**
 * An epic that saves the configuration if it has been changed.
 */
export const saveConfigOnChangeEpic = (
  action$: ActionsObservable<redux$Action>
) =>
  action$.pipe(
    ofType(actions.SET_CONFIG_AT_KEY),
    mapTo({ type: actions.SAVE_CONFIG })
  );

/**
 * An epic that saves the configuration.
 */
export const saveConfigEpic = (
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.SAVE_CONFIG),
    mergeMap(() =>
      writeFileObservable(
        CONFIG_FILE_PATH,
        JSON.stringify(state$.value.config.toJS())
      ).pipe(map(actions.doneSavingConfig))
    )
  );
