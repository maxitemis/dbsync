Feature: Synchronisation

  Scenario: Legacy Data Changes Causing Changes on Remote Server
    When name in legacy database changed
    Then name in modernised database also changes

  Scenario: Modern Data Changes Causing Changes on Legacy Server
    When name in modern database changed
    Then name in legacy database also changes

  Scenario: Legacy Data Insert Causing Insert in Modern Database
    When Record is added to legacy database
    Then The same records is added to modern database

  Scenario: Modern Data Insert Causing Insert in Legacy Database
    When Record is added to modern database
    Then The same records is added to legacy database

  Scenario: Legacy Data Delete Causing Delete in Modern Database
    When Record is added to legacy database
    When Record is synchronized with modern database
    When Record is delete from legacy database
    Then The same records is deleted from modern database

  Scenario: Modern Data Delete Causing Delete in Legacy Database
    When Record is added to modern database
    When Record is synchronized with legacy database
    When Record is delete from modern database
    Then The same records is deleted from legacy database
