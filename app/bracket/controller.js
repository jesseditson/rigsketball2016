import Ember from 'ember';

export default Ember.Controller.extend({
  rounds: Ember.computed.sort('model.rounds', (a, b) => {
    return a.get('index') < b.get('index') ? 1 : -1;
  })
});
