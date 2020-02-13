/**
 * Handle the environment in the game.
 */
export default class Env {
  constructor() {
  }

  isDrupal() {
    return (typeof drupalSettings !== 'undefined');
  }

}
