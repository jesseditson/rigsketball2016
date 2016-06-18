import Ember from 'ember';

const requiredFields = [
  'name',
  'website',
  'phone',
  'email',
  'address',
  'member_count',
  'trackURL',
  'imageURL'
]

export default Ember.Component.extend({
  classNames: ['signup-form'],
  store: Ember.inject.service(),
  band: null,
  init() {
    this._super(...arguments)
    this.set('band', this.get('store').createRecord('band'))
  },
  memberOptions: Ember.computed(function() {
    return [
      { name: 'Just Me.', value: 1 },
      { name: 'Me and This Other Dude/Chick.', value: 2 },
      { name: 'Three Piece.', value: 3 },
      { name: 'Four Rippers.', value: 4 },
      { name: 'Five Stinkers In A Van.', value: 5 },
      { name: 'Six, All In One Band.', value: 6 },
      { name: 'At This Point, We\'ll Just Say A Lot.', value: 7 }
    ]
  }),
  buttonTitle: Ember.computed('submitDisabled', function() {
    return this.get('submitDisabled') ? 'form incomplete' : 'go'
  }),
  submitDisabled: Ember.computed('band', function() {
    return !requiredFields.every(f => {
      var v = this.get('band').get(f)
      return v && v.length > 1
    })
  }),
  actions: {
    uploadTrack(file) {
      return file.upload('/api/upload-track').then(response => {
        console.log(response)
      })
    },
    uploadImage(file) {
      return file.upload('/api/upload-image').then(response => {
        console.log(response)
      })
    }
  }
});
