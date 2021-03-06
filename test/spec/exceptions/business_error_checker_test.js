/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const BusinessErrorChecker = require('../../../lib/exceptions/business_error_checker');
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types');
const FieldTypes = require('../../../lib/core/jhipster/field_types');
const RelationshipTypes = require('../../../lib/core/jhipster/relationship_types');
const UnaryOptions = require('../../../lib/core/jhipster/unary_options');
const Validations = require('../../../lib/core/jhipster/validations');
const JDLObject = require('../../../lib/core/jdl_object');
const JDLApplication = require('../../../lib/core/jdl_application');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLEnum = require('../../../lib/core/jdl_enum');
const JDLField = require('../../../lib/core/jdl_field');
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLValidation = require('../../../lib/core/jdl_validation');

describe('BusinessErrorChecker', () => {
  describe('#checkForErrors', () => {
    let checker = null;

    context('with no passed JDL object', () => {
      before(() => {
        checker = new BusinessErrorChecker();
      });

      it('does not fail', () => {
        expect(() => {
          checker.checkForErrors();
        }).not.to.throw();
      });
    });
    context('with a complete JDL object', () => {
      let applicationCheckSpy = null;
      let entityCheckSpy = null;
      let fieldCheckSpy = null;
      let validationCheckSpy = null;
      let relationshipCheckSpy = null;
      let enumCheckSpy = null;
      let optionCheckSpy = null;

      before(() => {
        const jdlObject = new JDLObject();
        const application = new JDLApplication({
          entities: ['MyEntity']
        });
        const entity = new JDLEntity({
          name: 'MyEntity'
        });
        const otherEntity = new JDLEntity({
          name: 'OtherEntity'
        });
        const field = new JDLField({
          name: 'myField',
          type: FieldTypes.CommonDBTypes.STRING
        });
        const validation = new JDLValidation({
          name: Validations.REQUIRED
        });
        const relationship = new JDLRelationship({
          from: entity,
          to: otherEntity,
          type: RelationshipTypes.ONE_TO_MANY,
          injectedFieldInFrom: 'other'
        });
        const option = new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
          entities: ['MyEntity']
        });
        const enumObject = new JDLEnum({
          name: 'MyEnum',
          values: ['A', 'B']
        });
        field.addValidation(validation);
        entity.addField(field);
        jdlObject.addEntity(entity);
        jdlObject.addEntity(otherEntity);
        jdlObject.addEnum(enumObject);
        jdlObject.addRelationship(relationship);
        jdlObject.addOption(option);
        jdlObject.addApplication(application);
        checker = new BusinessErrorChecker(jdlObject);
        applicationCheckSpy = sinon.spy(checker, 'checkForApplicationErrors');
        entityCheckSpy = sinon.spy(checker, 'checkForEntityErrors');
        fieldCheckSpy = sinon.spy(checker, 'checkForFieldErrors');
        validationCheckSpy = sinon.spy(checker, 'checkForValidationErrors');
        relationshipCheckSpy = sinon.spy(checker, 'checkForRelationshipErrors');
        enumCheckSpy = sinon.spy(checker, 'checkForEnumErrors');
        optionCheckSpy = sinon.spy(checker, 'checkForOptionErrors');
        checker.checkForErrors();
      });

      after(() => {
        applicationCheckSpy.restore();
        entityCheckSpy.restore();
        fieldCheckSpy.restore();
        validationCheckSpy.restore();
        relationshipCheckSpy.restore();
        enumCheckSpy.restore();
        optionCheckSpy.restore();
      });

      it('checks it', () => {
        expect(applicationCheckSpy).to.have.been.called;
        expect(entityCheckSpy).to.have.been.called;
        expect(fieldCheckSpy).to.have.been.called;
        expect(validationCheckSpy).to.have.been.called;
        expect(relationshipCheckSpy).to.have.been.called;
        expect(enumCheckSpy).to.have.been.called;
        expect(optionCheckSpy).to.have.been.called;
      });
    });
  });
  describe('#checkForApplicationErrors', () => {
    let checker = null;
    let jdlObject = null;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having an UAA application with skipped user management', () => {
      before(() => {
        jdlObject.addApplication(new JDLApplication({
          config: {
            applicationType: ApplicationTypes.UAA,
            skipUserManagement: true,
            uaaBaseName: 'uaa'
          }
        }));
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForApplicationErrors();
        }).to.throw('Skipping user management in a UAA app is forbidden.');
      });
    });
  });
  describe('#checkForEntityErrors', () => {
    let checker = null;
    let jdlObject = null;
    let checkForFieldErrorsStub = null;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addEntity(new JDLEntity({
        name: 'valid'
      }));
    });
    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('if there is at least one entity', () => {
      before(() => {
        checker = new BusinessErrorChecker(jdlObject);
        checkForFieldErrorsStub = sinon.stub(checker, 'checkForFieldErrors').returns(null);
        checker.checkForEntityErrors();
      });
      after(() => {
        checkForFieldErrorsStub.restore();
      });

      it('calls the field error checker method', () => {
        expect(checkForFieldErrorsStub).to.have.been.calledOnce;
      });
    });
    context('when having an entity with a reserved name', () => {
      before(() => {
        jdlObject.addEntity(new JDLEntity({
          name: 'valid'
        }));
        checker = new BusinessErrorChecker(jdlObject);
        jdlObject.entities.Continue = jdlObject.entities.valid;
        jdlObject.entities.Continue.name = 'Continue';
        delete jdlObject.entities.valid;
      });

      it('fails', () => {
        expect(() => {
          checker.checkForEntityErrors();
        }).to.throw('The name \'Continue\' is a reserved keyword and can not be used as an entity class name.');
      });
    });
    context('when not having applications but only entities', () => {
      context('with an entity having a reserved table name', () => {
        before(() => {
          jdlObject.addEntity(new JDLEntity({
            name: 'valid',
            tableName: 'continue'
          }));
          checker = new BusinessErrorChecker(jdlObject, {
            databaseType: DatabaseTypes.SQL
          });
        });

        it('fails', () => {
          expect(() => {
            checker.checkForEntityErrors();
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity table name.');
        });
      });
    });
    context('when having entities in applications', () => {
      context('with an entity having a reserved table name', () => {
        before(() => {
          jdlObject.addApplication(new JDLApplication({
            config: {
              databaseType: DatabaseTypes.SQL
            },
            entities: ['valid']
          }));
          jdlObject.addEntity(new JDLEntity({
            name: 'valid',
            tableName: 'continue'
          }));
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('fails', () => {
          expect(() => {
            checker.checkForEntityErrors();
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity table name for ' +
            'at least one of these applications: jhipster.');
        });
      });
    });
  });
  describe('#checkForFieldErrors', () => {
    let checker = null;
    let jdlObject = null;
    let checkForValidationErrorsStub = null;

    before(() => {
      jdlObject = new JDLObject();
      const entity = new JDLEntity({
        name: 'Valid'
      });
      entity.addField(new JDLField({
        name: 'validField',
        type: FieldTypes.CommonDBTypes.STRING
      }));
      jdlObject.addEntity(entity);
    });

    context('if there is at least one field', () => {
      before(() => {
        checker = new BusinessErrorChecker(jdlObject);
        checkForValidationErrorsStub = sinon.stub(checker, 'checkForValidationErrors').returns(null);
        checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
      });
      after(() => {
        checkForValidationErrorsStub.restore();
      });

      it('calls the validation error checker method', () => {
        expect(checkForValidationErrorsStub).to.have.been.calledOnce;
      });
    });
    context('if the field name is reserved', () => {
      before(() => {
        jdlObject.entities.Valid.fields.validField.name = 'catch';
        checker = new BusinessErrorChecker(jdlObject);
      });
      after(() => {
        jdlObject.entities.Valid.fields.validField.name = 'validField';
      });

      it('fails', () => {
        expect(() => {
          checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
        }).to.throw('The name \'catch\' is a reserved keyword and can not be used as an entity field name.');
      });
    });
    context('when passing gateway as application type', () => {
      context('with incompatible database type and field type', () => {
        before(() => {
          const validEntity = new JDLEntity({
            name: 'Valid'
          });
          validEntity.addField(new JDLField({
            name: 'validField',
            type: FieldTypes.CassandraTypes.UUID
          }));
          jdlObject.addEntity(validEntity);
          checker = new BusinessErrorChecker(jdlObject, {
            databaseType: DatabaseTypes.SQL,
            applicationType: ApplicationTypes.GATEWAY
          });
        });

        it('succeeds', () => {
          expect(() => {
            checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
          }).not.to.throw();
        });
      });
    });
    context('if the field type is invalid for a database type', () => {
      context('when checking a JDL object with a JDL application', () => {
        before(() => {
          jdlObject.addApplication(new JDLApplication({
            config: {
              databaseType: DatabaseTypes.SQL
            },
            entities: ['Valid']
          }));
          const validEntity = new JDLEntity({
            name: 'Valid',
            tableName: 'continue'
          });
          validEntity.addField(new JDLField({
            name: 'validField',
            type: FieldTypes.CommonDBTypes.STRING
          }));
          jdlObject.addEntity(validEntity);
          jdlObject.entities.Valid.fields.validField.name = 'continue';
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('fails', () => {
          expect(() => {
            checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity field name.');
        });
      });
      context('when checking a JDL object with no JDL application', () => {
        before(() => {
          const validEntity = new JDLEntity({
            name: 'Valid',
            tableName: 'continue'
          });
          validEntity.addField(new JDLField({
            name: 'validField',
            type: FieldTypes.CommonDBTypes.STRING
          }));
          jdlObject.addEntity(validEntity);
          jdlObject.entities.Valid.fields.validField.name = 'continue';
          checker = new BusinessErrorChecker(jdlObject, {
            databaseType: DatabaseTypes.SQL
          });
        });

        it('fails', () => {
          expect(() => {
            checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity field name.');
        });
      });
    });
  });
  describe('#checkForValidationErrors', () => {
    let checker = null;
    let jdlObject = null;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when passing an unsupported validation for a field', () => {
      before(() => {
        const entity = new JDLEntity({
          name: 'Valid'
        });
        const field = new JDLField({
          name: 'validField',
          type: FieldTypes.CommonDBTypes.STRING
        });
        field.addValidation(new JDLValidation({
          name: Validations.MIN,
          value: 42
        }));
        entity.addField(field);
        jdlObject.addEntity(entity);
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForValidationErrors(jdlObject.entities.Valid.fields.validField);
        }).to.throw('The validation \'min\' isn\'t supported for the type \'String\'.');
      });
    });
  });
  describe('#checkForRelationshipErrors', () => {
    let checker = null;
    let jdlObject = null;

    before(() => {
      jdlObject = new JDLObject();
    });
    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('when having User as source entity', () => {
      before(() => {
        const userEntity = new JDLEntity({
          name: 'User'
        });
        const otherEntity = new JDLEntity({
          name: 'Valid'
        });
        const relationship = new JDLRelationship({
          from: userEntity,
          to: otherEntity,
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'other'
        });
        jdlObject.addEntity(userEntity);
        jdlObject.addEntity(otherEntity);
        jdlObject.addRelationship(relationship);
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForRelationshipErrors();
        }).to.throw('Relationships from the User entity is not supported in the declaration between \'User\' and \'Valid\'.');
      });
    });
    context('when the source entity is missing', () => {
      before(() => {
        const sourceEntity = new JDLEntity({
          name: 'Source'
        });
        const otherEntity = new JDLEntity({
          name: 'Valid'
        });
        const relationship = new JDLRelationship({
          from: sourceEntity,
          to: otherEntity,
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'other'
        });
        jdlObject.addEntity(sourceEntity);
        jdlObject.addEntity(otherEntity);
        jdlObject.addRelationship(relationship);
        delete jdlObject.entities.Source;
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForRelationshipErrors();
        }).to.throw('In the relationship between Source and Valid, Source is not declared.');
      });
    });
    context('when the destination entity is missing', () => {
      context('if it is the User entity', () => {
        before(() => {
          const sourceEntity = new JDLEntity({
            name: 'Source'
          });
          const otherEntity = new JDLEntity({
            name: 'User'
          });
          const relationship = new JDLRelationship({
            from: sourceEntity,
            to: otherEntity,
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other'
          });
          jdlObject.addEntity(sourceEntity);
          jdlObject.addEntity(otherEntity);
          jdlObject.addRelationship(relationship);
          delete jdlObject.entities.User;
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('does not fail', () => {
          expect(() => {
            checker.checkForRelationshipErrors();
          }).not.to.throw();
        });
      });
      context('if it is not the User entity', () => {
        before(() => {
          const sourceEntity = new JDLEntity({
            name: 'Source'
          });
          const otherEntity = new JDLEntity({
            name: 'Other'
          });
          const relationship = new JDLRelationship({
            from: sourceEntity,
            to: otherEntity,
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other'
          });
          jdlObject.addEntity(sourceEntity);
          jdlObject.addEntity(otherEntity);
          jdlObject.addRelationship(relationship);
          delete jdlObject.entities.Other;
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('fails', () => {
          expect(() => {
            checker.checkForRelationshipErrors();
          }).to.throw('In the relationship between Source and Other, Other is not declared.');
        });
      });
    });
  });
  describe('#checkForEnumErrors', () => {
    let checker = null;
    let jdlObject = null;

    before(() => {
      jdlObject = new JDLObject();
    });
    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('when having a reserved name as class name', () => {
      before(() => {
        jdlObject.addEnum(new JDLEnum({
          name: 'GoodName'
        }));
        jdlObject.enums.GoodName.name = 'Catch';
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForEnumErrors();
        }).to.throw('The enum name \'Catch\' is reserved keyword and can not be used as enum class name.');
      });
    });
  });
  describe('#checkForOptionErrors', () => {
    let checker = null;
    let jdlObject = null;

    before(() => {
      jdlObject = new JDLObject();
    });
    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('when having a JDL with pagination and Cassandra as database type', () => {
      context('inside a JDL application', () => {
        before(() => {
          jdlObject.addApplication(new JDLApplication({
            config: {
              databaseType: DatabaseTypes.CASSANDRA
            },
            entities: ['A']
          }));
          jdlObject.addEntity(new JDLEntity({
            name: 'A'
          }));
          jdlObject.addOption(new JDLBinaryOption({
            name: BinaryOptions.Options.PAGINATION,
            value: BinaryOptions.Values.pagination.PAGER,
            entityNames: ['A']
          }));
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('fails', () => {
          expect(() => {
            checker.checkForOptionErrors();
          }).to.throw('Pagination isn\'t allowed when the app uses Cassandra, for entity: \'A\' and application: \'jhipster\'');
        });
      });
      context('not inside a JDL application', () => {
        before(() => {
          jdlObject.addOption(new JDLBinaryOption({
            name: BinaryOptions.Options.PAGINATION,
            value: BinaryOptions.Values.pagination.PAGER
          }));
          checker = new BusinessErrorChecker(jdlObject, { databaseType: DatabaseTypes.CASSANDRA });
        });

        it('fails', () => {
          expect(() => {
            checker.checkForOptionErrors();
          }).to.throw('Pagination isn\'t allowed when the app uses Cassandra.');
        });
      });
    });
    context('when not passing a value for a binary option', () => {
      before(() => {
        jdlObject.addOption(new JDLBinaryOption({
          name: BinaryOptions.Options.PAGINATION,
          value: BinaryOptions.Values.pagination.PAGER
        }));
        jdlObject.options.options.pagination_pager.value = '';
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForOptionErrors();
        }).to.throw('The \'pagination\' option needs a value.');
      });
    });
    context('when not passing a valid value for a binary option', () => {
      before(() => {
        jdlObject.addOption(new JDLBinaryOption({
          name: BinaryOptions.Options.PAGINATION,
          value: BinaryOptions.Values.pagination.PAGER
        }));
        jdlObject.options.options.pagination_pager.value = BinaryOptions.Values.dto.MAPSTRUCT;
        checker = new BusinessErrorChecker(jdlObject, { databaseType: DatabaseTypes.CASSANDRA });
      });

      it('fails', () => {
        expect(() => {
          checker.checkForOptionErrors();
        }).to.throw('The \'pagination\' option is not valid for value \'mapstruct\'.');
      });
    });
    context('when having DTOs without services', () => {
      before(() => {
        jdlObject.addOption(new JDLBinaryOption({
          name: BinaryOptions.Options.DTO,
          value: BinaryOptions.Values.dto.MAPSTRUCT,
          entityNames: ['A', 'B', 'C']
        }));
        jdlObject.addOption(new JDLBinaryOption({
          name: BinaryOptions.Options.SERVICE,
          value: BinaryOptions.Values.service.SERVICE_CLASS,
          entityNames: ['B']
        }));
        checker = new BusinessErrorChecker(jdlObject, { databaseType: DatabaseTypes.SQL });
      });

      it('fails', () => {
        expect(() => {
          checker.checkForOptionErrors();
        }).to.throw('Selecting DTOs without services is forbidden, for entities A, C.');
      });
    });
  });
});
