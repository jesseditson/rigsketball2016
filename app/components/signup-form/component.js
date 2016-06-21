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
  ajax: Ember.inject.service(),
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  router: Ember.inject.service(),
  band: null,
  init() {
    this._super(...arguments)
    this.set('band', this.get('store').createRecord('band', {
      name: 'foo',
      website: 'http://foo.com',
      phone: '1234567890',
      email: 'foo@bar.com',
      address: '123 foo st',
      member_count: 4,
      trackURL: 'https://s3-us-west-2.amazonaws.com/rigsketball/uploads/2bdbfdfc-e6d5-43e8-9481-6ede1a482ac6.m4a',
      imageURL: 'https://s3-us-west-2.amazonaws.com/rigsketball/uploads/1f8a5e48-7ef4-4003-8b37-1c5cc89bc498.jpeg'
    }))
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
  submitDisabled: Ember.computed(`band.{${requiredFields.join(',')}}`, function() {
    return !requiredFields.every(f => {
      var v = this.get('band').get(f)
      console.log(f, v)
      return !!v
    })
  }),
  uploadFile(files, uploadProp, bandProp) {
    if (!files.length) return
    var file = files[0]
    this.set(`band.${bandProp}`, null)
    return this.get('ajax').request('/api/sign-s3', {
      data: {
        'file-name': file.name,
        'file-type': file.type
      }
    }).then(response => {
      this.set(uploadProp, true)
      this.set(`band.${bandProp}`, response.url)
      return this.get('ajax').put(response.signedRequest, {
        dataType: 'text',
        contentType: file.type,
        processData: false,
        data: file
      })
    }).then(() => {
      this.set(uploadProp, false)
    }, err => {
      this.set('error', err)
      this.set(uploadProp, false)
    })
  },
  actions: {
    uploadTrack(files) {
      this.uploadFile(files, 'uploadingTrack', 'trackURL')
    },
    uploadImage(files) {
      this.uploadFile(files, 'uploadingImage', 'imageURL')
    },
    createBand() {
      this.get('band').save()
        .then(() => {
          this.get('session').setSigningUpBand(this.get('band'))
          this.sendAction('completed', this.get('band'))
        }, err => {
          this.set('error', err)
        })
    }
  }
});
