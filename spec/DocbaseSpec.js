describe("Docbase", function() {
  it("Docbase should exists globally", function() {
    expect(Docbase).not.toBeUndefined();
  });

  it("Should use config file when the parameter is a string", function() {
    Docbase.run('spec/json/docbase-sample.json');
    expect(Docbase.options['name']).toBe("testeFile");
  });

  it("Should use github as drive", function() {
    Docbase.run('spec/json/docbase-sample-github.json');
    expect(Docbase.options['name']).toBe("github");
  });

  it("Should use github as drive", function() {
    Docbase.run('spec/json/docbase-sample-generic.json');
    expect(Docbase.options['name']).toBe("generic");
  });

  it("Should throw an exception when drive is github and github.user is missing", function() {
    expect(function(){
      Docbase.run('spec/json/docbase-sample-github-without-user.json');
    }).toThrowError(/user/);
  });

  it("Should throw an exception when drive is github and github.repo is missing", function() {
    expect(function(){
      Docbase.run('spec/json/docbase-sample-github-without-repo.json');
    }).toThrowError(/repo/);
  });

  it("Should throw an exception when config file doesn't exists", function() {
    expect(function(){
      Docbase.run('spec/json/docbase-sample-nonexistent.json');
    }).toThrowError(/exists/);
  });
  it("Should throw an exception when config file is invalid", function() {
    expect(function(){
      Docbase.run('spec/json/docbase-sample-invalid-json.json');
    }).toThrowError(/invalid/);
  });

  it("Should use default config file when the parameter is empty", function() {
    Docbase.run();
    expect(Docbase.options['name']).toBe("defaultConfig");
  });

  it("Should the object as a configurations when an object is passed", function() {
    Docbase.run({
      name : 'objConfig',
      method: 'file',
      map: {
        file: 'map.json',
        path: '/'
      },
      "file" : {
        'path': 'src'
      },
      github: {
        user: 'appbaseio',
        repo: 'Docs',
        path: 'src',
        branch: 'master'
      },
      indexType: 'html',
      indexHtml: 'html/main.html',
      editGithubBtn: true,
      html5mode: false,
      flatdocHtml: 'html/flatdoc.html',
      angularAppName: 'docbaseApp'

    });
    expect(Docbase.options['name']).toBe("objConfig");
  });

});
