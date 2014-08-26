from flask import Flask, url_for, render_template
from flask_wtf import Form
from wtforms import SelectField
import os
import root_path as root
import netCDF4
import glob

class NetCdfForm(Form):
    variables = SelectField('test', choices=[])

app = Flask(__name__)

@app.route('/')
def index():
    form = NetCdfForm(csrf_enabled=False)
    path = os.path.join(root.x, "students", "mpoecht", "*.nc")

    netcdf_files = glob.glob(path)
    variablechoices = []
    netcdfData = []
    for file1 in netcdf_files:
        try:
            data = netCDF4.Dataset(file1, format='NETCDF4')
            netcdfData.append(data)
            i = 0
            for variable in data.variables:
                variablechoices.append((str(i), variable.encode('ascii', 'ignore')))
                i += 1
        except:
            pass
    pass
    form.variables.choices = variablechoices
    # return netcdfData[0].dataset_name
    return render_template('netcdfData.html', form=form, netcdfData=netcdfData)

@app.route('/hello')
def hello():
    return 'Hello World'


# run app
if __name__ == '__main__':

    # hostaddr = socket.gethostbyname(socket.gethostname())
    # local:
    # app.run(hostaddr, port=8082, debug=True)
    app.run(debug=True)
