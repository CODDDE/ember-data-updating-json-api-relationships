import DS from 'ember-data';
import { pluralize } from 'ember-inflector';
import { dasherize } from '@ember/string';
import { isArray } from '@ember/array';

export default DS.JSONAPIAdapter.extend({
  urlForUpdateRecord(id, modelName, snapshot) {
    let { adapterOptions } = snapshot;
    let originalUpdateURL = this._super(...arguments);

    if (this.urlForUpdateRelationship && adapterOptions) {
      return this.urlForUpdateRelationship(id, modelName, snapshot, adapterOptions.relationshipToUpdate);
    }

    if (adapterOptions && adapterOptions.relationshipToUpdate) {
      let { relationshipToUpdate } = adapterOptions;

      const path = dasherize(relationshipToUpdate);
      return `${originalUpdateURL}/relationships/${path}`;
    }

    return originalUpdateURL;
  },

  updateRecord(store, type, snapshot) {
    let { adapterOptions } = snapshot;

    if(adapterOptions && adapterOptions.requestType) {
      const data = this._createPayload(snapshot);
      let url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
      if(adapterOptions.requestType === 'createRelationship') {
        return this.ajax(url, "POST", { data })
          .then(() => null );
      }
      else if(adapterOptions.requestType === 'deleteRelationship') {
        return this.ajax(url, "DELETE", { data })
          .then(() => null );
      }
    }

    let promise = this._super(...arguments);
    if (adapterOptions && adapterOptions.relationshipToUpdate) {
      return promise.then(() => {
        return null;
      });
    }
    return promise;
  },

  _getRelationship(relationshipToUpdate, snapshot) {
    let relationshipDescriptor;
    snapshot.eachRelationship((name, relationship) => {
      if (name === relationshipToUpdate) {
        relationshipDescriptor = relationship;
      }
    });

    return relationshipDescriptor;
  },

  _serializeIdType(data) {
    return {
      id: data.id,
      type: pluralize(data.constructor.modelName)
    };
  },

  _createPayload(snapshot) {
    let payload = [];
    let { data } = snapshot.adapterOptions;
    const { relationshipToUpdate } = snapshot.adapterOptions;
    const relationship = this._getRelationship(relationshipToUpdate, snapshot);

    if(relationship.kind === 'hasMany') {
      if(isArray(data)) {
        data.forEach((objectModel) => {
          payload.pushObject(this._serializeIdType(objectModel));
        });
      } else {
        payload.pushObject(this._serializeIdType(data));
      }
      return { 'data': payload };
    }
    else {
      throw new Error('POST and DELETE methods are not allowed for belongsTo relationships');
    }
  },
});
