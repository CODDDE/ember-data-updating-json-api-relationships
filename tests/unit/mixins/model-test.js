import Ember from 'ember';
import UpdateRelationshipsModelMixin from 'ember-data-updating-json-api-relationships/mixins/model';
import { module, test } from 'qunit';

module('Unit | Mixin | model');

// Replace this with your real tests.
test('it works', function(assert) {
  let UpdateRelationshipsModelObject = Ember.Object.extend(UpdateRelationshipsModelMixin);
  let subject = UpdateRelationshipsModelObject.create();
  assert.ok(subject);
});
