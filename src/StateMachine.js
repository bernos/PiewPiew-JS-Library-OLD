/**
 * The state machine manages our application state.
 *
 * @version $id$
 *
 * Events related to the state machine are
 *
 * PMQuizStateMachine.ACTION
 *    tells statemachine to perform an action. this is the way to initialise a
 *    state transition. The state machine binds a handler for this event to
 *    $(document) meaning that it is easy to intiate a state transition from
 *    anywhere in the application by calling
 *      $(document).trigger(PMQuizStateMachine.ACTION, [actionName, dataObject]);
 *
 * PMQuizStateMachine.CANCEL
 *    tells statemachine to canel a transition. Should be triggered by the
 *    $(document) element as above. Usually triggered withing exiting and
 *    entering guards
 *
 * PMQuizStateMachine.CHANGE
 *    tells any observers that the statemachine has transitioned to
 *    a new state
 *
 * The state machine listens for PMQuizStateMachine.ACTION and
 * PMQuizStateMachine.CANCEL events by binding a handler to the $(document)
 * element. This makes it easy to intiate a state transition from  anywhere in
 * the application by calling
 *
 *  $(document).trigger(PMQuizStateMachine.ACTION, dataObject);
 * 
 * Transitions:
 *
 * When exiting a state, if that state has an associated exiting event name
 * that event will be fired. Event handlers will be passed the 'data'
 * argument that was included in the event that caused the transition to
 * commence. example..
 *
 *  $(document).trigger(PMQuizStateMachine.ACTION, ["actionName", {name:Sven, age:24}]);
 *
 * the name/age object will be forwarded on to any handlers that listen for the
 * exit/enter/change events dispatched by the statemachine
 *
 */
var PMQuizStateMachine = function(spec){

  /**
   * Spec for the statemachine
   */
  var _spec = spec || {};

  /**
   * jQuery element for binding and triggering events
   */
  var $el = $('<div/>');

  /**
   * Private storage for current state
   */
  var _currentState = null;

  /**
   * Private flag for marking a transition as cancelled
   */
  var _cancelled = false;

  var that = {

    /**
     * Proxy for the jQuery trigger method
     *
     * @param {string} eventType
     * @param {array} extraParameters
     */
    trigger: function(eventType, extraParameters) {
      $el.trigger(eventType, extraParameters);
    },

    /**
     * Proxy for the jQuery bind method
     *
     * @param {string} eventType
     * @param {object} eventData
     * @param {function} handler
     */
    bind: function(eventType, eventData, handler) {
      $el.bind(eventType, eventData, handler);
    },

    run: function() {
      if (this._getInitialState()) {
        this._transitionTo(this._getInitialState(), null);
      }
    },

    handleCancel: function(e) {
      this.cancel();
    },

    cancel: function() {
      _cancelled = true;
    },

    getCurrentState: function() {
      return _currentState;
    },

    handleAction: function(e, action, data) {
      this.doAction(action, data);
    },

    doAction: function(action, data) {
      var data = data || {};
      var target = this._getTargetForAction(action);
      var newState = this._getState(target);

      if (newState) {
        this._transitionTo(newState);
      }
    },

    _getTargetForAction: function(action) {
      if (null == _currentState)             return null;
      if (null == _currentState.transitions) return null;

      for (var i = 0; i < _currentState.transitions.length; i++) {
        if (_currentState.transitions[i]['action'] == action) {
          return _currentState.transitions[i]['target'];
        }
      }

      return null;
    },

    _getState: function(name) {
      if (null == name)         return null;
      if (null == _spec.states) return null;

      for (var i in _spec.states) {
        if (_spec.states[i]['name'] == name) {
          return _spec.states[i];
        }
      }

      return null;
    },

    _getInitialState: function() {
      return this._getState(_spec.initial);
    },

    _transitionTo: function(nextState, data) {
      if (nextState == null) return null;

      _cancelled = false;

      if (_currentState && _currentState.exiting) {
        this.trigger(_currentState.exiting, [data]);
      }

      // Check if exit guard cancelled transition
      if (_cancelled) {
        _cancelled = false;
        return null;
      }

      if (nextState.entering) {
        this.trigger(nextState.entering, [data]);
      }

      // Check if enter guard cancelled transition
      if (_cancelled) {
        _cancelled = false;
        return null;
      }

      _currentState = nextState;

      if (nextState.change) {
        this.trigger(nextState.change, [data]);
      }

      $(document).trigger(PMQuizStateMachine.CHANGE, [nextState]);
    }
  }

  // State machine will listen for action and cancel events from the $(document)
  // element. This makes it easy for any object to initiate a state transfer
  $(document).bind(PMQuizStateMachine.ACTION, PMQuizUtils.delegate(that, that.handleAction));
  $(document).bind(PMQuizStateMachine.CANCEL, PMQuizUtils.delegate(that, that.handleCancel));

  return that;
}

PMQuizStateMachine.CHANGE = "PMQuizStateMachine:change";
PMQuizStateMachine.CANCEL = "PMQuizStateMachine:cancel";
PMQuizStateMachine.ACTION = "PMQuizStateMachine:action";