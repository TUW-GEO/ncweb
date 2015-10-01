from flask import Flask, url_for, render_template, request, jsonify
from flask_wtf import Form
from wtforms import SelectField
import os
import root_path as root
import glob
import datetime
from thredds_crawler.crawl import Crawl
from urlparse import urlparse
import ConfigParser
import urllib2


class NetCdfForm(Form):
    variables = SelectField('variables', choices=[])
    files = SelectField('files', choices=[])

app = Flask(__name__)


@app.route('/')
def index():
    form = NetCdfForm(csrf_enabled=False)
    path = os.path.join(root.x, "students", "mpoecht", "*.nc")

    netcdf_files = glob.glob(path)
    filechoices = []
    netcdfData = []
    allData = []
    j = 0
    for file in netcdf_files:
        data = readNetCDF(file)
        allData.append(data)
        filechoices.append((str(j), data[0]))
        netcdfData.append(data[1])
        j += 1
    pass
    form.files.choices = filechoices
    form.variables.choices = allData[0][2]
    # return netcdfData[0].dataset_name
    return render_template('netcdfData.html', form=form, netcdfData=netcdfData, allData=allData)


@app.route('/hello')
def hello():
    return 'Hello World'


def getTimepositions(wmsData, varName):
    '''
    Returns the timepositions of observations for a variable
    :param wmsData:    WMS Response
    :param varName:    Name of the variable
    '''
    try:
        return wmsData.contents[varName].timepositions
    except:
        return []


@app.route('/wmsold', methods=['GET', 'POST'])
def wmsIndex():
    try:
        req_url = request.form['wmsSelect']
        print(req_url)
    except:
        req_url = ""

    if request.method == 'POST' and req_url != "":
        wmsData, variablechoices = wmsRequest(request.form['wmsSelect'])
        if len(variablechoices) > 0:
            req_var = variablechoices[0][1]
            if request.form['changedCtrl'] != 'wmsSelect':
                try:
                    req_var = request.form['ncvarSelect']
                except:
                    req_var = variablechoices[0][1]
            timepositions = getTimepositions(wmsData, req_var)
            if timepositions and len(timepositions) > 0:
                req_time = timepositions[0]
                if request.form['changedCtrl'] not in ('wmsSelect', 'ncvarSelect'):
                    try:
                        req_time = request.form['timeSelect']
                    except:
                        req_time = timepositions[0]
            else:
                req_time = ""
        else:
            variablechoices = (
                0, 'noVarFound', 'WMS Response doesn\'t contain any variables')
            timepositions = []
            req_var = variablechoices[1]
            req_time = ""
        return render_template('wmsData.html', wmsData=wmsData,
                               nc_variables=variablechoices,
                               timepositions=timepositions,
                               req_url=req_url,
                               req_var=req_var,
                               req_time=req_time)

    return render_template('wmsData.html', req_url=req_url)


@app.route('/wms')
def wmsJS():
    return render_template('wmsDataJS.html')


@app.route('/wmsnew')
def wmsFS():
    return render_template('wmsFullScreen.html')


@app.route('/wms/GetFileList', methods=['GET'])
def getFileList():

    url = request.args.get('url')
    print('URL: ' + url)
    # url = "http://localhost:8080/thredds/catalog/testAll/catalog.html"
    c = Crawl(str(url))
    print c.datasets
    filelist = {}
    l = []

    for i in c.datasets:
        element = {}
        element['name'] = i.name
        l.append(element)
        print element

    parsed = urlparse(url)
    filelist['files'] = l
    # filelist['root'] = parsed.scheme+'://'+parsed.netloc
    # # filelist['location'] = filelist['root']+parsed.path.split('.',1)[0]+'/'
    # filelist['location'] = filelist['root']+"/thredds/wms/testAll/"
    config = ConfigParser.ConfigParser()
    config.read('settings.cfg')

    wms_url = config.get("URLs", "wms")
    filelist['location'] = wms_url
    print filelist

    return jsonify(files=filelist['files'], location=filelist['location'])


@app.route('/GetConfigParam', methods=['GET'])
def getConfigParam():

    section = request.args.get('section')
    param = request.args.get('param')
    print('section: ' + section)
    print('param: ' + param)

    config = ConfigParser.ConfigParser()
    config.read('settings.cfg')

    value = config.get(section, param)
    print value

    return jsonify(value=value)


# run app
if __name__ == '__main__':

    # hostaddr = socket.gethostbyname(socket.gethostname())
    # local:
    # app.run(hostaddr, port=8082, debug=True)
    app.run(debug=True)
